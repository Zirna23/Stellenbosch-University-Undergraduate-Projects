import java.util.LinkedList;

/**
 * Graph class represents a Graph and provides methods to add edges and traverse through the graph.
 *
 * @author zirna
 */
class Graph {
    /**
     * An array of linked lists representing the adjacency list of nodes.
     */
    LinkedList<Edge>[] adjListOfNodes;

    /**
     * The number of nodes in the graph.
     */
    int numberOfNodes;

    /**
     * This constructor initialize the adjacency lists for all the vertices.
     *
     * @param numberOfNodes Total number of nodes in the graph.
     */
    Graph(int numberOfNodes) {
        this.numberOfNodes = numberOfNodes;
        adjListOfNodes = new LinkedList[numberOfNodes];

        //initialize adjacency lists for all the nodes
        for (int i = 0; i < numberOfNodes; i++) {
            adjListOfNodes[i] = new LinkedList<>();
        }

    }

    /**
     * This method creates a weighted edge between nodes.
     *
     * @param code The node storing its source, destination and weight.
     */
    public void addEdges(String[] code) {
        Edge edge = new Edge(code);
        int source = edge.source;
        adjListOfNodes[source].addFirst(edge); //for directed graph
    }

    /**
     * This method traverses through the graph in a depth first search manner to find all
     * the possible paths to an accept stat from the start state.
     *
     * @param currentNode The node we are currently on in the graph.
     * @param acceptNode  The accepted state node.
     * @param word        The path to the accepted state from the start state.
     */
    public void traverseGraph(int currentNode, int acceptNode, String word, char flag,
                              int wordLength) {

        if (flag == 'f' || flag == 'F') {
            if (currentNode == acceptNode) {
                Compress.path.add(word);
                return;
            }

            LinkedList<Edge> wordsList = adjListOfNodes[currentNode];
            for (int j = 0; j < wordsList.size(); j++) {
                word += wordsList.get(j).weight;
                traverseGraph(wordsList.get(j).destination, acceptNode, word, flag, wordLength);
                word = word.substring(0, word.length() - 1);
            }

        } else { // multi res
            System.out.println(word.length() + " " + wordLength);
            if (currentNode == acceptNode && word.length() == wordLength) {
                Compress.path.add(word);
                return;
            }

            LinkedList<Edge> wordsList = adjListOfNodes[currentNode];
            for (int j = 0; j < wordsList.size(); j++) {
                word += wordsList.get(j).weight;

                if (word.length() <= wordLength) {
                    traverseGraph(wordsList.get(j).destination, acceptNode, word, flag, wordLength);
                }

                word = word.substring(0, word.length() - 1);
            }
        }

    }

    /**
     * Prints the graph by iterating through the vertices and their corresponding edges.
     * Each edge is printed in the format: source vertex, destination vertex, weight.
     */
    public void printGraph() {

        for (int i = 0; i < numberOfNodes; i++) { //loop through the vertices
            LinkedList<Edge> list = adjListOfNodes[i]; // add those vertices to the linked list
            for (int j = list.size() - 1; j >= 0; j--) { // looping through the linked list
                System.out.println(i + " " + list.get(j).destination + " " + list.get(j).weight);
            }
        }
    }

}

/**
 * Edge class defines the properties and languages that make an edge.
 *
 * @author Zirna Lala 25863304
 */
class Edge {
    /**
     * The source node of the edge.
     */
    int source;

    /**
     * The destination node of the edge.
     */
    int destination;

    /**
     * The weight of the edge.
     */
    int weight;

    /**
     * This constructor defines the properties and languages that make an edge.
     *
     * @param coordinate The node storing its source, destination and weight.
     */
    Edge(String[] coordinate) {
        this.source = Integer.parseInt(coordinate[0]);
        this.destination = Integer.parseInt(coordinate[1]);
        this.weight = Integer.parseInt(coordinate[2]);
    }

}


