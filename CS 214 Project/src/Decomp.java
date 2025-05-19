import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

/**
 * Decomp class extends the Compress class and represents a decompression implementation.
 *
 * @author Zirna Lala 25863304
 */
public class Decomp extends Compress {

    /**
     * This method decompresses a given file and creates a png image of the decompressed data.
     * It uses the coordinates and accepted states obtained from the scanDecomp method to create
     * a graph and traverse it to obtain all possible paths. It then creates an image from the
     * longest word and fills it in with black pixels. The image is then saved as a png file
     * in the "out" directory.
     *
     * @param args       An array of Strings containing the input arguments.
     * @throws IOException if there is an error reading or writing the input and output files.
     */
    public static void decompression(String[] args) throws IOException {

        Graph g = new Graph(numberOfNodes);

        // add edged between nodes on the graph
        for (int i = 0; i < coordinates.size(); i++) {
            g.addEdges(coordinates.get(i));
        }

        // loop through accept states to get all the paths
        for (int i = 0; i < acceptedStates.length; i++) {
            g.traverseGraph(0, acceptedStates[i], "", args[2].charAt(0),
                    wordLength);
        }

        // finding the longest word for the image size
        imageSize = 0;
        for (int i = 0; i < path.size(); i++) {
            if (path.get(i).length() > imageSize) {
                imageSize = path.get(i).length();
            }
        }

        dimensions = (int) Math.pow(2, imageSize);
        BufferedImage bi = new BufferedImage(dimensions, dimensions, BufferedImage.TYPE_INT_RGB);
        g2d = bi.createGraphics();

        // creating image
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, dimensions, dimensions);

        colourPixels();

        // save and rename image as png
        String fileName = textFile.getName();
        String name = fileName.split("\\.")[0];
        File imageOutput = new File("out/" + name + "_dec.png");
        System.out.println(imageOutput);
        ImageIO.write(bi, "png", imageOutput); // change imageOutput to file destination

    }


    /**
     * This method colours the pixels of an image based on the specified path codes.
     * It loops through each path code, finds the corresponding x and y
     * coordinates and uses them to colour the pixel in the image.
     */
    public static void colourPixels() {

        for (int i = 0; i < path.size(); i++) {
            int x = 0;
            int y = 0;
            int rows = dimensions;
            int cols = dimensions;
            int size = dimensions;


            for (int j = 0; j < path.get(i).length(); j++) {
                size = size / 2;

                char code = path.get(i).charAt(j);

                if (code == '0') {
                    y = y + rows / 2;

                    rows = rows / 2;
                    cols = cols / 2;

                } else if (code == '1') {
                    rows = rows / 2;
                    cols = cols / 2;

                } else if (code == '2') {
                    x = x + cols / 2;
                    y = y + rows / 2;

                    rows = rows / 2;
                    cols = cols / 2;

                } else if (code == '3') {
                    x = x + cols / 2;

                    rows = rows / 2;
                    cols = cols / 2;

                }
            }

            g2d.setColor(Color.BLACK);
            g2d.fillRect(x, y, size, size);
        }

    }


}
