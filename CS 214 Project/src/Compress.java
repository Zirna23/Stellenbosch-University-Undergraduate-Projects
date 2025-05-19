import java.io.File;
import java.awt.Color;
import java.awt.Graphics2D;
import javax.imageio.ImageIO;
import java.io.IOException;
import java.awt.image.BufferedImage;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Scanner;

// https://tutorialhorizon.com/algorithms/weighted-graph-implementation-java/

/**
 * The Compress class reads data from a text file and performs validation checks on the input
 * arguments and file format. If the input arguments or file format are invalid, it prints an
 * error message and terminates the program. If the file is found and the input arguments and
 * file format are valid, it reads data from the file and stores it in appropriate variables.
 * It then creates an image based on the data and saves it as a PNG file.
 *
 * @author Zirna Lala 25863304
 */
public class Compress {

    /**
     * Represents the number of nodes.
     */
    static int numberOfNodes;

    /**
     * Represents the end states.
     */
    static String endStates;

    /**
     * Represents the word length.
     */
    static int wordLength = -1;

    /**
     * Represents the multi-resolution mode.
     */
    static int mrMode = -1;

    /**
     * Represents the multi-resolution information.
     */
    static String multiResolution;

    /**
     * Represents the input text file.
     */
    static File textFile;

    /**
     * Represents the image size.
     */
    static int imageSize;

    /**
     * Represents the dimensions.
     */
    static int dimensions;

    /**
     * Represents the input picture.
     */
    static BufferedImage picture;

    /**
     * Represents the Graphics2D object.
     */
    static Graphics2D g2d;

    /**
     * Represents the accepted states.
     */
    static int[] acceptedStates;

    /**
     * Represents the list of languages.
     */
    static ArrayList<ArrayList<String>> languages = new ArrayList<>();

    /**
     * Represents the list of coordinates.
     */
    static ArrayList<String[]> coordinates = new ArrayList<>();

    /**
     * Represents the current path.
     */
    static ArrayList<String> path = new ArrayList<>();

    /**
     * Main method for the program. Takes an array of command line arguments as input
     * and checks the second argument to determine which mode to execute the program
     * in. If the second argument is "1", it enters decompress mode and calls the
     * `decompress` method. If the second argument is "2", it enters compress mode and
     * calls the `scanCompress` method. If the second argument is "3", it enters
     * multi-resolution mode. If value[1] of the modes match, the program exits.
     *
     * @param args array of command line arguments
     * @throws IOException if an IO error occurs
     */
    public static void main(String[] args) throws IOException {

        // Input Errors
        inputErrorsCheck(args);

        String mode = args[1];
        char multiRes = args[2].charAt(0);

        // Decompress Mode
        if (mode.equals("1")) {
            scanDecomp(args);

            if (multiRes == 't' || multiRes == 'T') {
                wordLength = Integer.parseInt(args[3]);
            }

            Decomp d = new Decomp();

            d.decompression(args);

        } else if (mode.equals("2")) {  // Compress Mode

            scanCompress(args);

            if (multiRes == 't' || multiRes == 'T') {
                mrMode = Integer.parseInt(args[3]);
            }

            Comp c = new Comp();
            QuadTree qt = new QuadTree(picture.getHeight(), picture);

            qt.makeQuadTree(qt.root);
            qt.getPaths(qt.root, "");
            path = qt.pathways;
            c.getLanguages();
            c.getNodes();


        }

    }

    /**
     * Checks the validity of the input arguments for the program.
     *
     * @param args the command line arguments passed to the program
     * @throws FileNotFoundException if file is not found
     */
    public static void inputErrorsCheck(String[] args) throws FileNotFoundException {
        // Input Errors
        if (args.length == 1) {
            args = fileType(args[0]).split("\\s");
        }

        if (args.length < 4 || args.length > 5) {
            System.err.println("Input Error - Invalid number of arguments");
            System.exit(0);
        }

        String gui = args[0];
        String mode = args[1];
        multiResolution = args[2];
        String multiResParam;

        // Input Errors
        char guiType = gui.charAt(0);
        char modeType = mode.charAt(0);
        char mrType = multiResolution.charAt(0);

        if (!Character.isDigit(guiType) || !Character.isDigit(modeType)
                || !Character.isLetter(mrType)) {
            System.err.println("Input Error - Invalid argument type");
            System.exit(0);
        } else {
            if (guiType != '0' && guiType != '1' || gui.length() > 1) {
                System.err.println("Input Error - Invalid GUI argument");
                System.exit(0);
            }
            if (modeType != '1' && modeType != '2' || mode.length() > 1) {
                System.err.println("Input Error - Invalid mode");
                System.exit(0);
            }
            if (mrType != 'f' && mrType != 'F' && mrType != 't' && mrType != 'T'
                    || multiResolution.length() > 1) {
                System.err.println("Input Error - Invalid multi-resolution flag");
                System.exit(0);
            }

        }

        if ((multiResolution.equals("f") || multiResolution.equals("F"))
                && args.length == 4) {
            textFile = new File(args[3]);

        } else if ((multiResolution.equals("t") || multiResolution.equals("T"))
                && args.length == 5) {
            multiResParam = args[3];
            textFile = new File(args[4]);
        } else {
            System.err.println("Input Error - Invalid number of arguments");
            System.exit(0);
        }

        if (!textFile.exists() || !textFile.canRead()) {
            System.err.println("Input Error - Invalid or missing file");
            System.exit(0);
        }
    }

    /**
     * Returns the file type of the given file path. If the file is a PNG image, returns the file
     * name. If the file is a text file, returns the path to the file specified in the file's first
     * line.
     *
     * @param filePath the path of the file
     * @return the file type or path as specified above
     * @throws FileNotFoundException if the file does not exist
     */
    public static String fileType(String filePath) throws FileNotFoundException {
        String[] splited = filePath.split("/");
        String path = splited[splited.length - 1];

        String[] split = path.split("\\.");
        String extension = split[split.length - 1];

        if (extension.equals("png")) {
            return path;
        } else {
            Scanner sc = new Scanner(new File(filePath));
            String argument = sc.nextLine();

            return argument;
        }

    }

    /**
     * This method reads data from a text file and performs validation checks on the input arguments
     * and file format. If the input arguments or file format are invalid, it prints an error
     * message and terminates the program. If the file is found and the input arguments and file
     * format are valid, it reads data from the file and stores it in appropriate variables.
     *
     * @param args An array of Strings containing the input arguments.
     */
    public static void scanDecomp(String[] args) {
        //Decompression Errors
        String gui = args[0];
        String mode = args[1];
        String multiResolution = args[2];
        textFile = new File(args[3]);

        char guiType = gui.charAt(0);
        char modeType = mode.charAt(0);
        char mrType = multiResolution.charAt(0);

        // Decompression Errors
        if (guiType == '0' && (mrType == 't' || mrType == 'T')) {
            // invalid word length
            int wordLength = Integer.parseInt(args[3]);
            textFile = new File(args[4]);

            if (wordLength < 0) {
                System.err.println("Decompression Error - Invalid word length");
                System.exit(0);
            }
        }

        // reading from a text file using scanner
        Scanner scan;
        try {
            scan = new Scanner(textFile);

            if (scan.hasNextLine() && scan.hasNextInt()) {
                String states = scan.nextLine();
                char ch = states.charAt(0);
                if (!Character.isDigit(ch)) {
                    System.err.println("Decompress Error - Invalid automaton formatting");
                    System.exit(0);
                }

                // scanning and storing number of nodes
                numberOfNodes = Integer.parseInt(states);

                // scanning and storing accept states
                endStates = scan.nextLine();
                String[] acStates = endStates.split("\\s");

                acceptedStates = new int[acStates.length];

                for (int i = 0; i < acStates.length; i++) {
                    try {
                        acceptedStates[i] = Integer.parseInt(acStates[i]);

                        // checking that all the accept states are valid
                        if (acceptedStates[i] >= numberOfNodes || acceptedStates[i] < 0) {
                            System.err.println("Decompress Error - Invalid accept state");
                            System.exit(0);
                        }

                    } catch (Exception e) {
                        // making sure each language is a number
                        System.err.println("Decompress Error - Invalid automaton formatting");
                        System.exit(0);
                    }
                }

                // scanning and storing all paths
                while (scan.hasNextLine()) {
                    String path = scan.nextLine();
                    String[] splited = path.split("\\s+");

                    // checking if there are 3 languages in each line - src, dest and weight
                    if (splited.length != 3) {
                        System.err.println("Decompress Error - Invalid automaton formatting");
                        System.exit(0);
                    } else {
                        // checking if there are 3 languages per line and if they are numbers
                        for (int i = 0; i < 3; i++) {
                            for (int j = 0; j < splited[i].length(); j++) {

                                if (splited[i].charAt(j) != '-') {
                                    if (!Character.isDigit(splited[i].charAt(j))) {
                                        System.err.println("Decompress Error - "
                                                + "Invalid automaton formatting");
                                        System.exit(0);
                                    }
                                }

                            }

                            int languages = Integer.parseInt(splited[i]);
                            // checking that no source or destination > total states
                            if (i < 2) {
                                if (languages >= numberOfNodes || languages < 0) {
                                    System.err.println("Decompress Error - "
                                            + "Invalid transition");
                                    System.exit(0);
                                }
                            }

                            if (i == 2 && (languages < 0 || languages > 3)) {
                                System.err.println("Decompress Error - " + "Invalid transition");
                                System.exit(0);
                            }

                        }

                    }
                    coordinates.add(splited);
                    //System.out.println("size of graph " + coordinates.size());
                }
                scan.close();
            } else if (!scan.hasNextInt()) {
                // making sure each language is a number
                System.err.println("Decompress Error - Invalid automaton formatting");
                System.exit(0);
            }

        } catch (FileNotFoundException e) {
            System.out.println("File not found!");
        }
    }

    /**
     * This method reads in an image file and compresses it using a specified multi-resolution
     * method.
     *
     * @param args an array of command-line arguments containing the multi-resolution method and the
     *             file path to the image file.
     * @throws IOException if there is an error reading in the image file.
     */
    public static void scanCompress(String[] args) throws IOException {
        // Compression Errors
        picture = ImageIO.read(textFile);
        int picHeight = picture.getHeight();
        int picWidth = picture.getWidth();

        // checking if the image is square
        if (picHeight != picWidth) {
            System.err.println("Compress Error - Invalid input image");
            System.exit(0);
        }

        // Checking if the image is made up of black and white pixels only
        for (int y = 0; y < picHeight; y++) {
            for (int x = 0; x < picWidth; x++) {
                Color pixelColour = new Color(picture.getRGB(x, y));

                if (!pixelColour.equals(Color.BLACK)) {
                    if (!pixelColour.equals(Color.WHITE)) {
                        System.err.println("Compress Error - Invalid input image");
                        System.exit(0);
                    }
                }
            }
        }
    }

}
