from datetime import datetime
from pydoc import pager

import requests, os, re, time, backoff
from flask import Flask, jsonify, request
from bs4 import BeautifulSoup

app = Flask(__name__)

url = "https://stackoverflow.com"


@backoff.on_exception(backoff.expo, requests.exceptions.RequestException, factor=2)
def get_info(endpoint):
    page = requests.get(url + endpoint)
    print(page)

    # Check for 429 status code to handle rate limiting
    if page.status_code == 429:
        print(page)
        retry_after = int(page.headers.get('Retry-After', 60))
        time.sleep(retry_after)
        page = requests.get(url)  # Retry the request after waiting

    # Check for successful response
    if page.status_code != 200:
        return None

    return BeautifulSoup(page.content, 'html.parser')


@app.route('/collectives')
def get_collectives():
    page = request.args.get('page', 1)
    pagesize = request.args.get('pagesize', 15)
    order = request.args.get('order', 'desc')

    query_params = {
        'pagesize': pagesize,
        'page': page,
        'order': order,
    }

    query_string = '&'.join([f'{key}={value}' for key, value in query_params.items()])

    # Fetch the collectives information using the constructed query string
    soup = get_info(f'/collectives-all?{query_string}')

    collectives = []
    collectives_info = soup.find_all("div", class_="flex--item s-card bs-sm mb12 py16 fc-black-500")

    for info in collectives_info:
        collective = {}

        h1_tag = info.find('h1', class_='fs-body2 mb0 fc-blue-500')
        collective['name'] = h1_tag.find('a').text
        collective['link'] = h1_tag.find('a')['href']

        collective['description'] = info.find('span', class_="fs-body1 v-truncate2 ow-break-word").text.replace(
            '\u2019', "'")
        # TODO: fix: apostrophe changed to \u2019

        slug = info.find('a', class_='js-gps-track').get('data-gps-track')
        collective['slug'] = re.search(r'subcommunity_slug:\s*([a-zA-Z0-9-]+)', slug).group(1)

        # goes specifically into each collective
        # print(collective['link'])
        collect = get_info(collective['link'])
        tags = [tag.get('data-name') for tag in collect.find_all("div", {'data-name': True})]
        collective['tags'] = tags

        links = collect.find('optgroup', label='External links')

        collective['external_links'] = []

        for link in links.find_all('option'):
            collective['external_links'].append({
                "type": link.text,
                "link": link.get('data-url')
            })

        # collective['has_more'] = "false"

        collectives.append(collective)

        # print(collectives)

    return jsonify(collectives)


@app.route('/questions')
def get_questions():
    questions = []

    page = request.args.get('page', 1)
    pagesize = request.args.get('pagesize', 30)
    sort = request.args.get('sort', 'desc')
    tagged = request.args.get('tagged')

    num_q = int(pagesize)

    query_params = {
        'pagesize': pagesize,
        'page': page,
        'sort': sort,
        'tagged': tagged,
    }

    query_string = '&'.join([f'{key}={value}' for key, value in query_params.items()])
    print(f'/questions?{query_string}')

    soup = get_info(f'/questions?{query_string}')
    questions_info = soup.find_all("div", class_="s-post-summary")

    for info in questions_info:
        question = {}

        question['question_id'] = info.get('data-post-id')

        users = {}
        user1 = info.find("div", class_="s-user-card s-user-card__minimal")
        user2 = info.find("div", class_="s-user-card--link d-flex gs4")
        user3 = info.find("li", class_="s-user-card--rep")

        users['reputation'] = user3.find('span', class_='todo-no-class-here').text

        question_info = get_info('/questions/' + question.get('question_id'))
        print('/questions/' + question.get('question_id'))
        user_type = question_info.find('span', class_='mod-flair')

        users['user_type'] = "registered"
        if user_type:
            users['user_type'] = "moderator"

        users['account_id'] = None
        users['accept_rate'] = None
        users['profile_image'] = (user1.find('a')).find('img')['src']
        users['display_name'] = user2.find('a').text
        users['link'] = user1.find('a')['href']

        user_info = get_info(users['link'])
        script = user_info.find('script', string=re.compile('StackExchange\.user\.init')).string
        users['account_id'] = re.search(r'accountId:\s*(\d+)', script).group(1)
        users['user_id'] = re.search(r'userId:\s*(\d+)', script).group(1)

        question['owners'] = users

        meta = info.find("div", class_="s-post-summary--meta")
        tags = [t.text for t in meta.find_all("li", class_="d-inline mr4 js-post-tag-list-item")]
        question['tags'] = tags

        h3_tag = info.find('h3', class_="s-post-summary--content-title")
        stats = info.find('div', class_='s-post-summary--stats')
        views = stats.find('div', title=lambda x: x and 'view' in x)
        answers = stats.find('div', title=lambda x: x and 'answer' in x)
        score = stats.find('div', class_='s-post-summary--stats-item__emphasized')

        question['view_count'] = views.find('span', class_='s-post-summary--stats-item-number').text

        question['score'] = score.find('span', class_='s-post-summary--stats-item-number').text

        stats = info.find('div', class_='s-post-summary--stats')
        is_answered = stats.find("div", class_="s-post-summary--stats-item has-answers")

        if is_answered or int(question.get('score')) > 0:
            question['is_answered'] = True
            question['answer_count'] = answers.find('span', class_='s-post-summary--stats-item-number').text
            is_accepted = stats.find('div', class_="has-accepted-answer")
            if is_accepted:
                question['accepted_answer_id'] = question_info.find('div', class_='accepted-answer').get(
                    'data-answerid')
        else:
            question['is_answered'] = False
            question['answer_count'] = "0"

        edit = meta.find('time', class_='s-user-card--time')
        print(edit.text)
        question['last_activity_date'] = None
        question['creation_date'] = None

        if edit.text.split()[0] == 'modified':
            date_str = edit.find('span', class_='relativetime').get("title")
            date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%SZ")
            question['last_edit_date'] = date.timestamp()

        if edit.text.split()[0] == 'asked':
            date_str = edit.find('span', class_='relativetime').get("title")
            date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%SZ")
            question['creation_date'] = date.timestamp()
        # question['closed_date']

        licensing = get_info('/posts/' + question.get('question_id') + '/timeline')
        content = licensing.find("div", class_="subheader")

        question['content_license'] = content.find("h3", class_="flex--item").find("a").text.strip()
        question['title'] = h3_tag.find('a').text
        question['link'] = h3_tag.find('a')['href']
        # question['closed_reason']

        questions.append(question)

        num_q = num_q - 1
        if num_q == 0: break

    return jsonify(questions)


@app.route('/questions/<ids>')
def get_questions_by_id(ids):
    page = request.args.get('page', 1)
    pagesize = request.args.get('pagesize', 15)
    sort = request.args.get('sort', 'desc')

    query_params = {
        'pagesize': pagesize,
        'page': page,
        'sort': sort,
    }

    query_string = '&'.join([f'{key}={value}' for key, value in query_params.items()])

    soup = get_info(f'/questions/{ids}?{query_string}')

    questions = {}

    meta = soup.find("div", class_="d-flex ps-relative fw-wrap")
    tags = [t.text for t in meta.find_all("li", class_="d-inline mr4 js-post-tag-list-item")]
    questions['tags'] = tags

    users = {}
    user1 = soup.find("div", class_="user-info user-hover")
    user2 = soup.find("div", class_="user-details")
    user3 = soup.find("div", class_="-flair")

    user_type = soup.find('span', class_='mod-flair')

    users['user_type'] = "registered"
    if user_type:
        users['user_type'] = "moderator"

    users['link'] = url + user1.find('a')['href']
    users['reputation'] = user3.find('span', class_='reputation-score').text.strip()

    users['account_id'] = None
    users['profile_image'] = (user1.find('a')).find('img')['src']
    users['display_name'] = user2.find('a').text

    link = users['link'].split(".com", 1)
    user4 = get_info(link[1])
    script = user4.find('script', text=re.compile('StackExchange\.user\.init')).string
    users['account_id'] = re.search(r'accountId:\s*(\d+)', script).group(1)
    users['user_id'] = re.search(r'userId:\s*(\d+)', script).group(1)

    questions['owners'] = users

    questions['question_id'] = ids

    answers = soup.find("div", id="answers")

    if answers.get("class"):  # has no answers
        questions['is_answered'] = False
    else:
        questions['is_answered'] = True
        questions['answer_count'] = answers.find("h2", class_="mb0").get("data-answercount")
        is_accepted = answers.find('div', class_="accepted-answer")
        if is_accepted:
            questions['accepted_answer_id'] = answers.find('div', class_='js-post-menu pt2').get(
                'data-post-id')

    views = soup.find("div", class_="flex--item ws-nowrap mb8").get('title').split()
    # print(views)
    questions['view_count'] = views[1].replace(',', '')

    dates = soup.find_all("div", class_="flex--item ws-nowrap mr16 mb8")

    for date in dates:
        if date.find("a", href="?lastactivity"):
            date_str = date.find("a", href="?lastactivity").get("title")
            date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%SZ")
            questions['last_activity_date'] = date.timestamp()
        else:
            date_str = date.get("title")
            date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%SZ")
            questions['creation_date'] = date.timestamp()

    dates2 = soup.find("div", class_="d-flex fw-wrap ai-start jc-end gs8 gsy")
    user_info = dates2.find('div', class_='post-signature')
    # print(user_info)
    if user_info.find('div', class_='user-details').find('a') is None:
        user_info = user_info.find_next('div', class_='post-signature')

    edit_date = user_info.find('div', class_='user-action-time')
    # print(edit_date)
    if edit_date is not None:
        date_str = edit_date.find('span').get("title")
        date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%SZ")
        questions['last_edit_date'] = date.timestamp()

    questions['score'] = soup.find("div", class_="question js-question").get("data-score")

    header = soup.find("div", id="question-header").find("h1", itemprop="name")
    questions['title'] = url + header.find('a').text
    questions['link'] = header.find('a')['href']

    licensing = get_info('/posts/' + ids + '/timeline')
    content = licensing.find("div", class_="subheader")

    questions['content_license'] = content.find("h3", class_="flex--item").find("a").text.strip()

    return jsonify(questions)


@app.route('/questions/<ids>/answers')
def get_answers_by_question_id(ids):
    page = request.args.get('page', 1)
    pagesize = request.args.get('pagesize', 15)
    order = request.args.get('order', 'desc')

    query_params = {
        'pagesize': pagesize,
        'page': page,
        'order': order,
    }

    query_string = '&'.join([f'{key}={value}' for key, value in query_params.items()])

    soup = get_info(f'/questions/{ids}/answers?{query_string}')

    answers = []

    answers_block = soup.find_all('div',
                                  attrs={'class': lambda x: x and 'answer' in x.split() and 'js-answer' in x.split()})

    for ans in answers_block:
        users = {}
        answer = {}

        answer['question_id'] = ids

        is_accepted = ans.get('itemprop')
        answer['answer_id'] = ans.get('data-answerid')

        answer['score'] = ans.find('div', itemprop='upvoteCount').text.strip()

        if is_accepted == 'acceptedAnswer':
            answer['is_accepted'] = True
        else:
            answer['is_accepted'] = False

        dates = ans.find("div", class_="d-flex fw-wrap ai-start jc-end gs8 gsy")
        date_str = dates.find('time').get("datetime")
        str = date_str.replace('T', ' ')
        date = datetime.strptime(str, "%Y-%m-%d %H:%M:%S")
        answer['creation_date'] = date.timestamp()
        answer['last_activity_date'] = date.timestamp()

        user_info = dates.find('div', class_='post-signature')
        # print(user_info)
        if user_info.find('div', class_='user-details').find('a') is None:
            user_info = user_info.find_next('div', class_='post-signature')

        edit_date = user_info.find('div', class_='user-action-time')
        # print(edit_date)
        if edit_date is not None:
            date_str = edit_date.find('span').get("title")
            date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%SZ")
            answer['last_edit_date'] = date.timestamp()
            answer['last_activity_date'] = date.timestamp()

        users['link'] = url + user_info.find('div', class_='user-details').find('a')['href']
        users['display_name'] = user_info.find('div', class_='user-details').find('a').text

        user1 = user_info.find('div', class_='user-gravatar32')
        users['profile_image'] = user1.find('img')['src']

        link = users['link'].split(".com", 1)
        user4 = get_info(link[1])
        script = user4.find('script', text=re.compile('StackExchange\.user\.init')).string
        users['account_id'] = re.search(r'accountId:\s*(\d+)', script).group(1)
        users['user_id'] = re.search(r'userId:\s*(\d+)', script).group(1)

        rep = dates.find('div', class_='-flair')
        # print(rep)
        users['reputation'] = rep.find('span', class_='reputation-score').text
        user_type = soup.find('span', class_='mod-flair')

        users['user_type'] = "registered"
        if user_type:
            users['user_type'] = "moderator"

        answer['content_license'] = dates.find('a', class_='js-share-link js-gps-track').get(
            'data-se-share-sheet-license-name')
        answer['owner'] = users

        answers.append(answer)

    return jsonify(answers)


@app.route('/answers/<ids>')
def get_answers_by_id(ids):
    page = request.args.get('page', 1)
    pagesize = request.args.get('pagesize', 15)
    order = request.args.get('order', 'desc')

    query_params = {
        'pagesize': pagesize,
        'page': page,
        'order': order,
    }

    query_string = '&'.join([f'{key}={value}' for key, value in query_params.items()])

    soup = get_info(f'/a/{ids}?{query_string}')

    answers = []

    a = 'answer-' + ids
    ans = soup.find('div', id=a)

    users = {}
    answer = {}

    answer['question_id'] = ans.get('data-parentid')

    answer['answer_id'] = ids

    answer['score'] = ans.find('div', itemprop='upvoteCount').text.strip()

    is_accepted = ans.get('itemprop')
    if is_accepted == 'suggestedAnswer':
        answer['is_accepted'] = False
    else:
        answer['is_accepted'] = True

    dates = ans.find("div", class_="d-flex fw-wrap ai-start jc-end gs8 gsy")
    date_str = dates.find('time').get("datetime")
    str = date_str.replace('T', ' ')
    date = datetime.strptime(str, "%Y-%m-%d %H:%M:%S")
    answer['creation_date'] = date.timestamp()
    answer['last_activity_date'] = date.timestamp()

    user_info = dates.find('div', class_='post-signature')

    users['link'] = url + user_info.find('div', class_='user-details').find('a')['href']
    users['display_name'] = user_info.find('div', class_='user-details').find('a').text

    # print(user_info)
    if user_info.find('div', class_='user-details').find('a') is None or user_info.find('div',
                                                                                        class_='user-details').find(
        'a').text == 'Community':
        edit_date = user_info.find('div', class_='user-action-time')
        # print(edit_date)
        if edit_date is not None:
            date_str = edit_date.find('span').get("title")
            date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%SZ")
            answer['last_edit_date'] = date.timestamp()
            if answer['last_edit_date'] < answer['last_activity_date']:
                answer['last_activity_date'] = date.timestamp()
        user_info = user_info.find_next('div', class_='post-signature')

    users['link'] = url + user_info.find('div', class_='user-details').find('a')['href']
    users['display_name'] = user_info.find('div', class_='user-details').find('a').text

    user1 = user_info.find('div', class_='user-gravatar32')
    users['profile_image'] = user1.find('img')['src']

    link = users['link'].split(".com", 1)
    user4 = get_info(link[1])
    # print(users['display_name'])
    script = user4.find('script', text=re.compile('StackExchange\.user\.init')).string
    # print(script)
    users['account_id'] = re.search(r'accountId:\s*(\d+)', script).group(1)
    users['user_id'] = re.search(r'userId:\s*(\d+)', script).group(1)

    rep = dates.find('div', class_='-flair')
    # print(rep)
    users['reputation'] = rep.find('span', class_='reputation-score').text
    user_type = soup.find('span', class_='mod-flair')

    users['user_type'] = "registered"
    if user_type:
        users['user_type'] = "moderator"

    answer['content_license'] = dates.find('a', class_='js-share-link js-gps-track').get(
        'data-se-share-sheet-license-name')
    answer['owner'] = users

    answers.append(answer)

    return jsonify(answers)


if __name__ == '__main__':
    app.run(port=os.getenv('STACKOVERFLOW_API_PORT', 23468))
