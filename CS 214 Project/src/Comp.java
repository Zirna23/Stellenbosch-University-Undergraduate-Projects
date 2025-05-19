import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.Arrays;

/**
 * Represents a subclass of Compress called Comp. This class provides methods for extracting nodes
 * from an input file, storing them into a languages list, generating output in the form of a text
 * file, and adding unique languages to the list based on the prefix of each word.
 *
 * @author Zirna Lala 25863304
 */
public class Comp extends Compress {

    /**
     * This method extracts nodes from input file and stores them into languages list
     * It also generates output in form of textFileOutput
     *
     * @throws IOException if an I/O error occurs
     */
    public static void getNodes() throws IOException {

        numberOfNodes = languages.size();
        Graph g = new Graph(numberOfNodes);
        String[] code = new String[3];
        Arrays.fill(code, "-1");

        String acceptStates = "";
        ArrayList<Integer> acStates = new ArrayList<>();
        for (int i = 0; i < languages.size(); i++) {
            if (languages.get(i).isEmpty()) {
                acStates.add(i);
                acceptStates += i + " ";
            }
        }

        MultiRes m = new MultiRes(g, acStates);
        if (mrMode == 1) {
            m.sierpinskiTriangle();
        } else if (mrMode == 2) {
            m.checkerboard();
        }

        ArrayList<String> currLanguage;

        for (int x = 0; x < languages.size(); x++) {
            ArrayList<String> pathways = languages.get(x);

            int zero = -1;
            int one = -1;
            int two = -1;
            int three = -1;

            for (int i = 0; i < pathways.size(); i++) {
                String word = pathways.get(i);
                if (!word.equals("")) {
                    if (word.substring(0, 1).equals("0")) {
                        zero = 0;
                    } else if (word.substring(0, 1).equals("1")) {
                        one = 0;
                    } else if (word.substring(0, 1).equals("2")) {
                        two = 0;
                    } else if (word.substring(0, 1).equals("3")) {
                        three = 0;
                    }
                }
            }

            if (zero == 0) {
                currLanguage = new ArrayList<>();

                // loops over the pathways and add words that start with "0"
                for (int i = 0; i < pathways.size(); i++) {
                    String pathway = pathways.get(i);
                    if (pathway.startsWith("0") && pathway.length() > 1) {
                        currLanguage.add(pathway.substring(1));
                    }
                }
                // checks if the language already exists in the list
                int languageIndex = languages.indexOf(currLanguage);

                code[0] = String.valueOf(x);
                code[1] = String.valueOf(languageIndex);
                code[2] = String.valueOf(0);
                g.addEdges(code);
            }

            if (one == 0) {
                currLanguage = new ArrayList<>();

                // loops over the pathways and add words that start with "1"
                for (int i = 0; i < pathways.size(); i++) {
                    String pathway = pathways.get(i);
                    if (pathway.startsWith("1") && pathway.length() > 1) {
                        currLanguage.add(pathway.substring(1));
                    }
                }
                // checks if the language already exists in the list
                int languageIndex = languages.indexOf(currLanguage);

                code[0] = String.valueOf(x);
                code[1] = String.valueOf(languageIndex);
                code[2] = String.valueOf(1);
                g.addEdges(code);
            }

            if (two == 0) {
                currLanguage = new ArrayList<>();

                // loops over the pathways and add words that start with "2"
                for (int i = 0; i < pathways.size(); i++) {
                    String pathway = pathways.get(i);
                    if (pathway.startsWith("2") && pathway.length() > 1) {
                        currLanguage.add(pathway.substring(1));
                    }
                }
                // checks if the language already exists in the list
                int languageIndex = languages.indexOf(currLanguage);

                code[0] = String.valueOf(x);
                code[1] = String.valueOf(languageIndex);
                code[2] = String.valueOf(2);
                g.addEdges(code);
            }

            if (three == 0) {
                // create a new list to hold the words in the language
                currLanguage = new ArrayList<>();

                // loops over the pathways and add words that start with "3"
                for (int i = 0; i < pathways.size(); i++) {
                    String pathway = pathways.get(i);
                    if (pathway.startsWith("3") && pathway.length() > 1) {
                        currLanguage.add(pathway.substring(1));
                    }
                }
                // checks if the language already exists in the list
                int languageIndex = languages.indexOf(currLanguage);

                code[0] = String.valueOf(x);
                code[1] = String.valueOf(languageIndex);
                code[2] = String.valueOf(3);
                g.addEdges(code);
            }
        }

        //printing to the text file
        makeTextFile(m, g, acStates);
    }

    /**
     * Adds unique languages to a list of languages based on the prefix of each word in the
     * language.
     */
    public static void getLanguages() {
        languages.add(path);
        ArrayList<String> currLanguage;

        for (int x = 0; x < languages.size(); x++) {
            ArrayList<String> pathways = languages.get(x);

            int zero = -1;
            int one = -1;
            int two = -1;
            int three = -1;

            for (int i = 0; i < pathways.size(); i++) {
                String word = pathways.get(i);
                if (!word.equals("")) {
                    if (word.substring(0, 1).equals("0")) {
                        zero = 0;
                    } else if (word.substring(0, 1).equals("1")) {
                        one = 0;
                    } else if (word.substring(0, 1).equals("2")) {
                        two = 0;
                    } else if (word.substring(0, 1).equals("3")) {
                        three = 0;
                    }
                }
            }

            if (zero == 0) {
                currLanguage = new ArrayList<>();

                // loops over the pathways and add words that start with "0"
                for (int i = 0; i < pathways.size(); i++) {
                    String pathway = pathways.get(i);
                    if (pathway.startsWith("0") && pathway.length() > 1) {
                        currLanguage.add(pathway.substring(1));
                    }
                }

                if (!languages.contains(currLanguage)) {
                    languages.add(currLanguage);
                }
            }

            if (one == 0) {
                currLanguage = new ArrayList<>();

                // loops over the pathways and add words that start with "1"
                for (int i = 0; i < pathways.size(); i++) {
                    String pathway = pathways.get(i);
                    if (pathway.startsWith("1") && pathway.length() > 1) {
                        currLanguage.add(pathway.substring(1));
                    }
                }

                if (!languages.contains(currLanguage)) {
                    languages.add(currLanguage);
                }
            }

            if (two == 0) {
                currLanguage = new ArrayList<>();

                // loops over the pathways and add words that start with "2"
                for (int i = 0; i < pathways.size(); i++) {
                    String pathway = pathways.get(i);
                    if (pathway.startsWith("2") && pathway.length() > 1) {
                        currLanguage.add(pathway.substring(1));
                    }
                }

                if (!languages.contains(currLanguage)) {
                    languages.add(currLanguage);
                }
            }

            if (three == 0) {
                // create a new list to hold the words in the language
                currLanguage = new ArrayList<>();

                // loops over the pathways and add words that start with "3"
                for (int i = 0; i < pathways.size(); i++) {
                    String pathway = pathways.get(i);
                    if (pathway.startsWith("3") && pathway.length() > 1) {
                        currLanguage.add(pathway.substring(1));
                    }
                }

                if (!languages.contains(currLanguage)) {
                    languages.add(currLanguage);
                }
            }
        }
    }

    /**
     * Generates a text file containing the compressed output based on the MultiRes object,
     * Graph object, and the list of accept states.
     * The generated text file includes the number of states, the list of accept states,
     * and the transitions between states.
     *
     * @param m        The MultiRes object representing the compressed graph
     * @param g        The Graph object representing the graph
     * @param acStates The list of accept states
     * @throws IOException if an I/O error occurs
     */
    public static void makeTextFile(MultiRes m, Graph g, ArrayList<Integer> acStates)
            throws IOException {
        String fileName = textFile.getName();
        String name = fileName.split("\\.")[0];
        FileWriter fw = new FileWriter("out/" + name + "_cmp.txt");
        BufferedWriter bw = new BufferedWriter(fw);

        ArrayList<String> transitions = new ArrayList<>();

        bw.write(String.valueOf(languages.size())); // number of states

        if (mrMode == 3) {
            acStates = m.reduce();
        }

        String accept = "";
        for (int i = 0; i < acStates.size(); i++) {
            accept += acStates.get(i) + " ";  // list of accept states
        }
        bw.write("\n" + accept);  // list of accept states
        for (int i = 0; i < numberOfNodes; i++) { //loop through the vertices
            LinkedList<Edge> list = g.adjListOfNodes[i]; // add those vertices to the linked list
            for (int j = list.size() - 1; j >= 0; j--) { // looping through the linked list
                transitions.add(i + " " + list.get(j).destination + " " + list.get(j).weight);
            }
        }

        for (int i = 0; i < transitions.size(); i++) {
            bw.write("\n" + transitions.get(i));
        }

        bw.close();
    }
}
