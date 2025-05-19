import java.awt.Color;
import java.util.ArrayList;
import java.util.Arrays;

/**
 * MultiRes class extends the Compress class and represents a multi-resolution compression
 * implementation.
 *
 * @author Zirna Lala 25863304
 */
public class MultiRes extends Compress {

    /**
     * The graph object representing the data to be compressed.
     */
    public Graph g;

    /**
     * The list of accepted integers.
     */
    public ArrayList<Integer> accepted;

    /**
     * Constructs a new MultiRes instance with the specified graph and list of accepted integers.
     *
     * @param g        The graph object representing the data to be compressed.
     * @param accepted The list of accepted integers.
     */
    public MultiRes(Graph g, ArrayList<Integer> accepted) {
        this.g = g;
        this.accepted = accepted;
    }

    /**
     * Represents a method for generating a Sierpinski Triangle based on pixel colors in an image.
     */
    public void sierpinskiTriangle() {

        // finding the quadrant with the most black pixels
        int[] quad = new int[4];
        Arrays.fill(quad, 0);
        for (int i = 0; i < picture.getHeight(); i++) {
            for (int j = 0; j < picture.getWidth(); j++) {
                Color pixelColour = new Color(picture.getRGB(j, i));

                if (pixelColour.equals(Color.WHITE)) {
                    if (i >= picture.getHeight() / 2 && j < picture.getWidth() / 2) { // Q0
                        quad[0]++;
                    } else if (i < picture.getHeight() / 2 && j < picture.getWidth() / 2) { // Q1
                        quad[1]++;
                    } else if (i >= picture.getHeight() / 2 && j >= picture.getWidth() / 2) { // Q2
                        quad[2]++;
                    } else if (i < picture.getHeight() / 2 && j >= picture.getWidth() / 2) { // Q3
                        quad[3]++;
                    }
                }

            }
        }

        // quadrants with the most white pixels
        int whitestQuad = -1;
        int whitestQuadValue = quad[0];
        for (int i = 1; i < 4; i++) {
            if (quad[i] > whitestQuadValue) {
                whitestQuad = i;
            }
        }
        System.out.println(whitestQuad);

        for (int i = 0; i < accepted.size(); i++) {
            for (int j = 0; j < 4; j++) {
                if (j != whitestQuad) {
                    String[] code = new String[3];
                    code[0] = String.valueOf(accepted.get(i));
                    code[1] = String.valueOf(accepted.get(i));
                    code[2] = String.valueOf(j);
                    g.addEdges(code);
                }
            }

        }

        // replace a black with 4 pixel 3 black  by:
        // adding 3 cycles from accept states to itself with weights that aren't the white quad

        //add cycle
        //run comp - then add 3 extra edges before print txt file
    }

    /**
     * Represents a method for creating a checkerboard pattern.
     */
    public void checkerboard() {

        // Add edges to create a checkerboard pattern
        for (int i = 0; i < 4; i++) {

            // Create an array to hold the code
            String[] code = new String[3];
            code[0] = "0"; // State 0
            code[1] = "0"; // Weight 0
            code[2] = String.valueOf(i); // Cycle index

            // Add the edges based on the code
            g.addEdges(code);
        }

        // Add cycles to the start state (0 - 0) for each weight
    }

    /**
     * Reduces the graph by modifying the accept states and returns the updated list of accept
     * states.
     *
     * @return The updated list of accept states after reduction.
     */
    public ArrayList<Integer> reduce() {

        // get edges
        // change accept states
        // print new accept states
        for (int i = 0; i < numberOfNodes; i++) {
            if (!accepted.contains(i)) {
                accepted.add(i);
            }
        }
        System.out.println(accepted);

        return accepted;
        // make every state an accept state
        // just before you get txt file
        // change accpet states
        // print accept stats

    }
}

