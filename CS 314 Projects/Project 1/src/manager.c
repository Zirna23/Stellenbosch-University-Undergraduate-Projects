/**
 * @mainpage Process Simulation
 *
 */

#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "proc_structs.h"
#include "proc_syntax.h"
#include "logger.h"
#include "manager.h"

#define LOWEST_PRIORITY -1 // Use INT_MAX if 0 has the highest priority

int num_processes = 0;
int scheduler = 0;

/**
 * The queues as required by the spec
 */
static pcb_queue_t terminatedq;
static pcb_queue_t waitingq;
static pcb_queue_t readyq;
static bool_t readyq_updated;

void schedule_fcfs();
void schedule_rr(int quantum);
void schedule_pri_w_pre();
bool_t higher_priority(int, int);

void execute_instr(pcb_t *proc, instr_t *instr);
void request_resource(pcb_t *proc, instr_t *instr);
void release_resource(pcb_t *proc, instr_t *instr);
bool_t acquire_resource(pcb_t *proc, char *resource_name);

void check_for_new_arrivals();
void move_proc_to_wq(pcb_t *pcb, char *resource_name);
void move_waiting_pcbs_to_rq(char *resource_name);
void move_proc_to_rq(pcb_t *pcb);
void move_proc_to_tq(pcb_t *pcb);
void enqueue_pcb(pcb_t *proc, pcb_queue_t *queue);
pcb_t *dequeue_pcb(pcb_queue_t *queue);

char *get_init_data(int num_args, char **argv);
char *get_data(int num_args, char **argv);
int get_algo(int num_args, char **argv);
int get_time_quantum(int num_args, char **argv);
void print_args(char *data1, char *data2, int sched, int tq);

void print_avail_resources(void);
void print_alloc_resources(pcb_t *proc);
void print_queue(pcb_queue_t queue, char *msg);
void print_running(pcb_t *proc, char *msg);
void print_instructions(instr_t *instr);

int main(int argc, char **argv)
{
    char *data1 = get_init_data(argc, argv);
    char *data2 = get_data(argc, argv);
    scheduler = get_algo(argc, argv);
    int time_quantum = get_time_quantum(argc, argv);
    print_args(data1, data2, scheduler, time_quantum);

    pcb_t *initial_procs = NULL;
    if (strcmp(data1, "generate") == 0)
    {
#ifdef DEBUG_MNGR
        printf("****Generate processes and initialise the system\n");
#endif
        initial_procs = init_loader_from_generator();
    }
    else
    {
#ifdef DEBUG_MNGR
        printf("Parse process files and initialise the system: %s, %s \n", data1, data2);
#endif
        initial_procs = init_loader_from_files(data1, data2);
    }

    /* schedule the processes */
    if (initial_procs)
    {
        num_processes = get_num_procs();
        init_queues(initial_procs);
        printf("***********Scheduling processes************\n");
        schedule_processes(scheduler, time_quantum);
        dealloc_data_structures();
    }
    else
    {
        printf("Error: no processes to schedule\n");
    }

    return EXIT_SUCCESS;
}

/**
 * @brief The linked list of loaded processes is moved to the readyqueue.
 *        The waiting and terminated queues are intialised to empty
 * @param cur_pcb: a pointer to the linked list of loaded processes
 */
void init_queues(pcb_t *cur_pcb)
{
    readyq.first = cur_pcb;
    for (cur_pcb = readyq.first; cur_pcb->next != NULL; cur_pcb = cur_pcb->next)
        ;
    readyq.last = cur_pcb;
    readyq_updated = FALSE;

    waitingq.last = NULL;
    waitingq.first = NULL;
    terminatedq.last = NULL;
    terminatedq.first = NULL;

#ifdef DEBUG_MNGR
    printf("-----------------------------------");
    print_queue(readyq, "Ready");
    printf("\n-----------------------------------");
    print_queue(waitingq, "Waiting");
    printf("\n-----------------------------------");
    print_queue(terminatedq, "Terminated");
    printf("\n");
#endif /* DEBUG_MNGR */
}

/**
 * @brief Schedules each instruction of each process
 *
 * @param type The scheduling algorithm to use
 * @param quantum The time quantum for the RR algorithm, if used.
 */
void schedule_processes(schedule_t sched_type, int quantum)
{
    printf("TODO: Implement two schedulers: a Priority based scheduler and either a Round Robin (RR) scheduler or a FCFS scheduler \n");

    switch (sched_type)
    {
    case PRIOR:
        schedule_pri_w_pre();
        break;
    case RR:
        schedule_rr(quantum);
        break;
    case FCFS:
        schedule_fcfs();
        break;
    default:
        break;
    }
}

/** Schedules processes using priority scheduling with preemption */
void schedule_pri_w_pre()
{
    while (readyq.first != NULL)
    {
        pcb_t *prev_proc = NULL, *proc_before_highest = NULL;
        pcb_t *cur_proc = readyq.first, *high_pri_proc = readyq.first;

        // finds the process in the ready queue with the highest priority
        while (cur_proc != NULL)
        {
            switch (higher_priority(cur_proc->priority, high_pri_proc->priority))
            {
            case 1:
                high_pri_proc = cur_proc;
                proc_before_highest = prev_proc;
                break;
            case 0:
            default:
                break;
            }
            prev_proc = cur_proc;
            cur_proc = cur_proc->next;
        }

        if (high_pri_proc != NULL)
        {
            // removes the selected process from the ready queue
            if (high_pri_proc == readyq.first)
            {
                readyq.first = high_pri_proc->next;
            }
            else
            {
                proc_before_highest->next = high_pri_proc->next;
            }

            if (high_pri_proc->next == NULL)
            {
                readyq.last = proc_before_highest;
            }

            // execute the process's instructions
            while (high_pri_proc->next_instruction)
            {
                execute_instr(high_pri_proc, high_pri_proc->next_instruction);

                if (high_pri_proc->state == WAITING)
                {
                    break;
                }

                high_pri_proc->next_instruction = high_pri_proc->next_instruction->next;
                check_for_new_arrivals();

                // checks if the new process has a higher priority than the current highest priority
                if (readyq.first && readyq.last->priority > high_pri_proc->priority)
                {
                    // if new process has higher priority it moves the current highest priority back into the ready queue
                    move_proc_to_rq(high_pri_proc);
                    high_pri_proc = readyq.last;
                    break;
                }

                if (high_pri_proc->state == WAITING)
                {
                    break;
                }
            }

            // if all the process's instruction are executed - move process to termination queue
            if (!high_pri_proc->next_instruction)
            {
                move_proc_to_tq(high_pri_proc);
            }
        }
    }
}

/** Schedules processes using FCFS scheduling */
void schedule_fcfs()
{
    pcb_t *proc = readyq.first;

    while (proc != NULL)
    {
        dequeue_pcb(&readyq);

        for (instr_t *instr = proc->next_instruction; instr != NULL; instr = instr->next)
        {
            execute_instr(proc, instr);

            /* Check for new arrivals */
            check_for_new_arrivals();
        }

        move_proc_to_tq(proc);
        proc = readyq.first;
    }
}

/**
 * Schedules processes using the Round-Robin scheduler.
 *
 * @param[in] quantum time quantum
 */
void schedule_rr(int quantum)
{
    /* TODO: Implement if chosen as 2nd option */
    print_queue(readyq, "rr processes");
}

/**
 * Executes a process instruction.
 *
 * @param[in] pcb
 *     processs for which to execute the instruction
 * @param[in] instr
 *     instruction to execute
 */
void execute_instr(pcb_t *pcb, instr_t *instr)
{
    if (instr != NULL)
    {
        switch (instr->type)
        {
        case REQ_OP:
            request_resource(pcb, instr);
            break;
        case REL_OP:
            release_resource(pcb, instr);
            break;
        default:
            break;
        }
    }
    else
    {
        printf("Error: No instruction to execute\n");
    }

#ifdef DEBUG_MNGR
    printf("-----------------------------------");
    print_running(pcb, "Running");
    printf("\n-----------------------------------");
    print_queue(readyq, "Ready");
    printf("\n-----------------------------------");
    print_queue(waitingq, "Waiting");
    printf("\n-----------------------------------");
    print_queue(terminatedq, "Terminated");
    printf("\n");
#endif
}

/**
 * @brief Handles the request resource instruction.
 *
 * Executes the request instruction for the process. The function loops
 * through the list of resources and acquires the resource if it is available.
 * If the resource is not available the process is moved to the waiting queue
 *
 * @param current The current process for which the resource must be acquired.
 * @param instruct The request instruction
 */
void request_resource(pcb_t *cur_pcb, instr_t *instr)
{

    resource_t *resources;

    for (resources = get_available_resources(); resources != NULL; resources = resources->next)
    {
        //  If resource is available
        if (strcmp(resources->name, instr->resource_name) == 0)
        {
            //  If resource acquired
            switch (acquire_resource(cur_pcb, resources->name))
            {
            case 1:
            {
                resource_t *resource = cur_pcb->resources;
                resources->available = NO;

                while (resource != NULL)
                {
                    resource = resource->next;
                }
                log_request_acquired(cur_pcb->process_in_mem->name, instr->resource_name);
                return;
            }
            case 0:
            {
                cur_pcb->state = WAITING;
                move_proc_to_wq(cur_pcb, instr->resource_name);
                return;
            }
            }
        }
    }
}

/**
 * @brief Acquires a resource for a process.
 *
 * @param[in] process
 *     process for which to acquire the resource
 * @param[in] resource
 *     resource name
 * @return TRUE if the resource was successfully acquire_resource; FALSE otherwise
 */
bool_t acquire_resource(pcb_t *cur_pcb, char *resource_name)
{
    resource_t *resource = get_available_resources();

    while (resource != NULL)
    {

        // check if the name of the current resource matches the required resource name
        if (strcmp(resource->name, resource_name) == 0)
        {
            /* If resource is available, assign it to the process */
            if (resource->available == YES)
            {

                /* Add resource to the process's list of allocated resources */
                resource_t *temp = (resource_t *)malloc(sizeof(resource_t));
                temp->available = NO;
                temp->name = resource_name;
                temp->next = cur_pcb->resources;
                cur_pcb->resources = temp;

                return 1;
            }
        }
        // move to next rsource in the available resources list
        resource = resource->next;
    }

    return 0;
}

/**
 * @brief Handles the release resource instruction.
 *
 * Executes the release instruction for the process. If the resource can be
 * released the process is ready for next execution. If the resource can not
 * be released the process waits
 *
 * @param current The process which releases the resource.
 * @param instruct The instruction to release the resource.
 */
void release_resource(pcb_t *pcb, instr_t *instr)
{

    resource_t *resource = pcb->resources, *prev_resource = NULL;

    /* Find the resource in the process's list of allocated resources */
    for (; resource != NULL; resource = resource->next)
    {
        /* Resource needed is found */
        if (strcmp(resource->name, instr->resource_name) == 0)
        {
            if (resource != NULL)
            {
                /* marks resource as available */
                resource_t *global_resource = get_available_resources();

                for (; strcmp(global_resource->name, resource->name) != 0; global_resource = global_resource->next)
                    ;

                global_resource->available = YES;
                resource->available = YES;

                /* Remove resource from the process's list of resources */
                if (prev_resource != NULL)
                {
                    prev_resource->next = resource->next;
                }
                else
                {
                    pcb->resources = resource->next;
                }

                /* Log successful release */
                log_release_released(pcb->process_in_mem->name, instr->resource_name);
                move_waiting_pcbs_to_rq(resource->name);
                return;
            }
            else
            {
                /* Resource not assigned to process, log release error */
                log_release_error(pcb->process_in_mem->name, instr->resource_name);
                return;
            }
        }

        prev_resource = resource;
    }
}

/**
 * Add new process <code>pcb</code> to ready queue
 */
void check_for_new_arrivals()
{

    pcb_t *new_pcb = get_new_pcb();

    if (new_pcb)
    {
        printf("New process arriving: %s\n", new_pcb->process_in_mem->name);
        new_pcb->state = READY;
        move_proc_to_rq(new_pcb);
    }
}

/**
 * @brief Move process <code>pcb</code> to the ready queue
 *
 * @param[in] pcb
 */
void move_proc_to_rq(pcb_t *pcb)
{
    /* changes process state to READY */
    pcb->state = READY;

    /* moves process to the ready queue */
    enqueue_pcb(pcb, &readyq);

    log_request_ready(pcb->process_in_mem->name);
}

/**
 * Move process <code>pcb</code> to waiting queue
 */
void move_proc_to_wq(pcb_t *pcb, char *resource_name)
{
    /* changes process state to WAITING */
    pcb->state = WAITING;

    /* move process to the waiting queue */
    enqueue_pcb(pcb, &waitingq);

    log_request_waiting(pcb->process_in_mem->name, resource_name);
}

/**
 * Move process <code>pcb</code> to terminated queue
 *
 * @param[in] pcb
 */
void move_proc_to_tq(pcb_t *pcb)
{
    /* changes process state to TERMINATED */
    pcb->state = TERMINATED;

    /* move process to the terminated queue */
    enqueue_pcb(pcb, &terminatedq);

    log_terminated(pcb->process_in_mem->name);
}

/**
 * Moves all processes waiting for resource <code>resource_name</code>
 * from the waiting queue to the readyq queue.
 *
 * @param[in]   resource
 *     resource name
 */
void move_waiting_pcbs_to_rq(char *resource_name)
{
    pcb_t *current = waitingq.first;

    // iterate over every node
    while (current != NULL)
    {
        char *required_resource = current->next_instruction->resource_name;

        resource_t *avail_resource = get_available_resources();

        // iterate over every resource in the get_available_resources() list
        while (avail_resource != NULL)
        {
            if (strcmp(required_resource, avail_resource->name) == 0 && avail_resource->available == YES)
            {
                // Set the state of the current process to READY
                current->state = READY;

                // enqueue the current process into the ready queue
                enqueue_pcb(current, &readyq);

                // dequeue the current process from the waiting queue
                dequeue_pcb(&waitingq);
                log_request_ready(current->process_in_mem->name);
                return;
            }

            avail_resource = avail_resource->next;
        }
        // move the current process into the waiting queue
        current = current->next;
    }
}

/**
 * Enqueues process <code>pcb</code> to <code>queue</code>.
 *
 * @param[in] process
 *     process to enqueue
 * @param[in] queue
 *     queue to which the process must be enqueued
 */
void enqueue_pcb(pcb_t *pcb, pcb_queue_t *queue)
{
    // Check if queue is empty
    if (queue->first == NULL)
    {
        // If the queue is empty, set first process to new pcb
        queue->first = pcb;
    }
    else
    {
        queue->last->next = pcb;
    }

    // set last node of queue to pcb
    queue->last = pcb;
    pcb->next = NULL;
}

/**
 * Dequeues a process from queue <code>queue</code>.
 *
 * @param[in] queue
 *     queue from which to dequeue a process
 * @return dequeued process
 */
pcb_t *dequeue_pcb(pcb_queue_t *queue)
{
    pcb_t *deq;

    if (queue->first == NULL)
    {
        return NULL;
    }

    /* Setting the next process in the list as the first process */
    deq = queue->first;
    queue->first = queue->first->next;
    deq->next = NULL;

    /* checking if the queue is empty*/
    if (queue->first == NULL)
    {
        queue->last = NULL;
    }

    return deq;
}

/** @brief Return TRUE if pri1 has a higher priority than pri2
 *         where higher values == higher priorities
 *
 * @param[in] pri1
 *     priority value 1
 * @param[in] pri2
 *     priority value 2
 */
bool_t higher_priority(int pri1, int pri2)
{

    if (pri1 <= pri2)
    {
        return FALSE;
    }

    return TRUE;
}

/**
 * @brief Inspect the waiting queue and detects deadlock
 */
struct pcb_t *detect_deadlock()
{
    //  printf("Function detect_deadlock not implemented\n");

    // if deadlock detected
    // log_deadlock_detected();

    return NULL;
}

/**
 * @brief Releases a processes' resources and sets it to its first instruction.
 *
 * Generates release instructions for each of the processes' resoures and forces
 * it to execute those instructions.
 *
 * @param pcb The process chosen to be reset and release all of its resources.
 *
 */
void resolve_deadlock()
{
    /* TODO: Implement */
    printf("Function resolve_deadlock not implemented\n");
}

/**
 * @brief Deallocates the queues
 */
void free_manager(void)
{
#ifdef DEBUG_MNGR
    print_queue(readyq, "Ready");
    print_queue(waitingq, "Waiting");
    print_queue(terminatedq, "Terminated");
#endif

#ifdef DEBUG_MNGR
    printf("\nFreeing the queues...\n");
#endif
    dealloc_pcb_list(readyq.first);
    dealloc_pcb_list(waitingq.first);
    dealloc_pcb_list(terminatedq.first);
}

/**
 * @brief Retrieves the name of a process file or the codename "generator" from the list of arguments
 */
char *get_init_data(int num_args, char **argv)
{
    char *data_origin = "generate";
    if (num_args > 1)
        return argv[1];
    else
        return data_origin;
}

/**
 * @brief Retrieves the name of a process file or the codename "generator" from the list of arguments
 */
char *get_data(int num_args, char **argv)
{
    char *data_origin = "generate";
    if (num_args > 2)
        return argv[2];
    else
        return data_origin;
}

/**
 * @brief Retrieves the scheduler algorithm type from the list of arguments
 */
int get_algo(int num_args, char **argv)
{
    if (num_args > 3)
        return atoi(argv[3]);
    else
        return 1;
}

/**
 * @brief Retrieves the time quantum from the list of arguments
 */
int get_time_quantum(int num_args, char **argv)
{
    if (num_args > 4)
        return atoi(argv[4]);
    else
        return 1;
}

/**
 * @brief Print the arguments of the program
 */
void print_args(char *data1, char *data2, int sched, int tq)
{
    printf("Arguments: data1 = %s, data2 = %s, scheduler = %s,  time quantum = %d\n", data1, data2, (sched == 0) ? "priority" : "RR", tq);
}

/**
 * @brief Print the names of the global resources available in the system in linked list order
 */
void print_avail_resources(void)
{
    struct resource_t *resource;

    printf("Available:");
    for (resource = get_available_resources(); resource != NULL; resource = resource->next)
    {
        if (resource->available == YES)
        {
            printf(" %s", resource->name);
        }
    }
    printf(" ");
}

/**
 * @brief Print the names of the resources allocated to <code>process</code> in linked list order.
 */
void print_alloc_resources(pcb_t *proc)
{
    struct resource_t *resource;

    if (proc)
    {
        printf("Allocated to %s:", proc->process_in_mem->name);
        for (resource = proc->resources; resource != NULL; resource = resource->next)
        {
            printf(" %s", resource->name);
        }
        printf(" ");
    }
}

/**
 * @brief Print <code>msg</code> and the names of the processes in <code>queue</code> in linked list order.
 */
void print_queue(pcb_queue_t queue, char *msg)
{
    pcb_t *proc = queue.first;

    printf("%s:", msg);
    while (proc != NULL)
    {
        printf(" %s", proc->process_in_mem->name);
        proc = proc->next;
    }
    printf(" ");
}

/**
 * @brief Print <code>msg</code> and the names of the process currently running
 */
void print_running(pcb_t *proc, char *msg)
{
    printf("%s:", msg);
    if (proc != NULL)
    {
        printf(" %s", proc->process_in_mem->name);
    }
    printf(" ");
}

/**
 * @brief Print a linked list of instructions
 */
void print_instructions(instr_t *instr)
{
    instr_t *tmp_instr = instr;
    while (tmp_instr != NULL)
    {
        switch (tmp_instr->type)
        {
        case REQ_OP:
            printf("(req %s)\n", tmp_instr->resource_name);
            break;
        case REL_OP:
            printf("(rel %s)\n", tmp_instr->resource_name);
            break;
        case SEND_OP:
            printf("(send %s %s)\n", tmp_instr->resource_name, tmp_instr->msg);
            break;
        case RECV_OP:
            printf("(recv %s %s)\n", tmp_instr->resource_name, tmp_instr->msg);
            break;
        }
        tmp_instr = tmp_instr->next;
    }
}
