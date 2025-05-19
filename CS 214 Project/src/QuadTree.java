import java.awt.Color;
import java.awt.image.BufferedImage;
import java.util.ArrayList;

/**
 * Represents a QuadTree data structure for image processing.
 * It stores the root node of the QuadTree, the image, its size, and maintains a list of pathways.
 *
 * @author Zirna Lala 25863304
 */
class QuadTree {

    /**
     * Represents the picture used in the quadtree.
     */
    static BufferedImage pic;

    /**
     * Represents the root node of the quadtree.
     */
    Node root;

    /**
     * Represents the size of the picture.
     */
    int picSize;

    /**
     * Represents the list of pathways.
     */
    static ArrayList<String> pathways = new ArrayList<>();

    /**
     * Represents a QuadTree data structure for a given picture.
     * It stores the picture and its size, and maintains the root node of the QuadTree.
     *
     * @param picSize The size of the picture.
     * @param pic     The BufferedImage representing the picture.
     */
    QuadTree(int picSize, BufferedImage pic) {
        this.pic = pic;
        this.picSize = picSize;
        root = new Node(0, 0, picSize, "");

    }

    /**
     * Represents a node in a quadtree structure.
     * Each node has coordinates, size, an index, and flags indicating its leaf and black status.
     * It also contains an array of four child nodes representing its quadrants.
     *
     * @author Zirna Lala 25863304
     */
    static class Node {
        /**
         * The x-coordinate of the node.
         */
        int x;

        /**
         * The y-coordinate of the node.
         */
        int y;

        /**
         * The size of the node.
         */
        int size;

        /**
         * The index of the node.
         */
        String index;

        /**
         * Indicates whether the node is a leaf node.
         */
        boolean isLeaf;

        /**
         * Indicates whether the node is black.
         */
        boolean isBlack;

        /**
         * The quadrants of the node.
         */
        Node[] quadrants;

        /**
         * Represents a node in a quadtree structure. Each node has coordinates, size, an index,
         * and flags indicating its leaf and black status. It also contains an array of four child
         * nodes representing its quadrants.
         *
         * @param x     The x-coordinate of the node.
         * @param y     The y-coordinate of the node.
         * @param size  The size of the node.
         * @param index The index of the node.
         */
        Node(int x, int y, int size, String index) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.index = index;
            this.isLeaf = false;
            this.isBlack = false;
            this.quadrants = new Node[4];
        }

    }

    /**
     * Splits the specified node into four quadrants. Each quadrant represents a sub-node with a
     * smaller size and specific coordinates. The 'isLeaf' flag of the node is set to false after
     * the split.
     *
     * @param node The node to be split into quadrants.
     */
    public static void splitQuadrants(Node node) {
        int x = node.x;
        int y = node.y;
        int size = node.size;
        node.isLeaf = false;
        node.quadrants[0] = new Node(x, y + size / 2, size / 2, "0");
        node.quadrants[1] = new Node(x, y, size / 2, "1");
        node.quadrants[2] = new Node(x + size / 2, y + size / 2, size / 2, "2");
        node.quadrants[3] = new Node(x + size / 2, y, size / 2, "3");
    }

    /**
     * Checks if there is at least one black pixel within the specified node.
     *
     * @param node The node containing the pixels to be checked.
     * @return {@code true} if at least one black pixel is found, {@code false} otherwise.
     */
    public static boolean isOneBlack(Node node) {
        int x = node.x;
        int y = node.y;
        int size = node.size;
        int sizeX = x + size;
        int sizeY = y + size;

        for (int i = x; i < sizeX; i++) {    //columns
            for (int j = y; j < sizeY; j++) {    //rows
                //System.out.println("pixel coordinate " + i + " " + j);
                Color pixelColour = new Color(pic.getRGB(i, j));

                // checking if pixel is black
                if (pixelColour.equals(Color.BLACK)) {
                    //System.out.println("black coordinate " + i + " " + j);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Checks if all pixels within the specified node are black.
     *
     * @param node The node containing the pixels to be checked.
     * @return {@code true} if all pixels are black, {@code false} otherwise.
     */
    public static boolean isAllBlack(Node node) {
        int x = node.x;
        int y = node.y;
        int size = node.size;
        int sizeX = x + size;
        int sizeY = y + size;

        for (int i = x; i < sizeX; i++) {    //columns
            for (int j = y; j < sizeY; j++) {    //rows

                Color pixelColour = new Color(pic.getRGB(i, j));

                // checking if pixel is black
                if (pixelColour.equals(Color.WHITE)) {
                    return false;
                }
            }
        }
        return true;
    }


    /**
     * Recursively constructs a quadtree structure based on the given node. If the node contains all
     * black pixels, it is marked as a leaf node. If the node contains only one black pixel, it is
     * split into quadrants and the 'makeQuadTree' method is called recursively for each quadrant.
     *
     * @param node The current node being processed.
     */

    public static void makeQuadTree(Node node) {
        if (isAllBlack(node)) {
            node.isLeaf = true;
        } else if (isOneBlack(node)) {
            splitQuadrants(node);
            for (int i = 0; i < 4; i++) {
                makeQuadTree(node.quadrants[i]);
            }
        }
    }

    /**
     * Recursively generates and collects paths from the given node in a tree structure. The paths
     * are stored in the 'pathways' list.
     *
     * @param node The current node being traversed.
     * @param path The path accumulated so far.
     */
    public static void getPaths(Node node, String path) {
        // Add the index number of each child to the path
        String index = "";
        if (node != null) {
            index = node.index;
        }

        String newPath = path + index;

        if (node != null) {
            if (node.isLeaf) {
                if (!pathways.contains(newPath)) {
                    pathways.add(newPath);
                }
            } else {
                // Recursively traverse the child nodes
                getPaths(node.quadrants[0], newPath);
                getPaths(node.quadrants[1], newPath);
                getPaths(node.quadrants[2], newPath);
                getPaths(node.quadrants[3], newPath);
            }
        }

    }

}




