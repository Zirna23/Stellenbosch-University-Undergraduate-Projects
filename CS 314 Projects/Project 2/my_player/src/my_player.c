/************************************************************************
 *
 *  This is a skeleton to guide development of Gomuku engines that is intended
 *  to be used with the Ingenious Framework.
 *
 *  The skeleton has a simple random strategy that can be used as a starting point.
 *  Currently the master thread (rank 0) runs a random strategy and handles the
 *  communication with the referee, and the worker threads currently do nothing.
 *  Some form of backtracking algorithm, minimax, negamax, alpha-beta pruning etc.
 *  in parallel should be implemented.
 *
 *  Therfore, skeleton code provided can be modified and altered to implement different
 *  strategies for the Gomuku game. However, the flow of communication with the referee,
 *  relies on the Ingenious Framework and should not be changed.
 *
 *  Each engine is wrapped in a process which communicates with the referee, by
 *  sending and receiving messages via the server hosted by the Ingenious Framework.
 *
 *  The communication enumes are defined in comms.h and are as follows:
 *	  - GENERATE_MOVE: Referee is asking for a move to be made.
 *	  - PLAY_MOVE: Referee is forwarding the opponent's move. For this engine to update the
 *				  board state.
 *	 - MATCH_RESET: Referee is asking for the board to be reset. For another game.
 *	 - GAME_TERMINATION: Referee is asking for the game to be terminated.
 *
 *  IMPORTANT NOTE FOR DEBBUGING:
 *	  - Print statements to stdout will most likely not be visible when running the engine with the
 *		Ingenious Framework. Therefore, it is recommended to print to a log file instead. The name of
 *		the file is defined as PLAYER_NAME_LOG, this can be changed, but should be unique when compared
 *		to the other engine/s in the directory. The pointer to the log file is passed to the initialise_master
 *		function.
 *
 *  Author: Joshua James Venter
 *  Date: 2024/01/07
 *
 ************************************************************************/
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <mpi.h>
#include <arpa/inet.h>
#include <time.h>
#include <limits.h>
#include "comms.h"

#define EMPTY -1
#define BLACK 0
#define WHITE 1

#define MAX_MOVES 361
#define MAX_DEPTH 2
#define K 5

const char *PLAYER_NAME_LOG = "my_player.log";

void run_master(int, char *[]);
int initialise_master(int, char *[], int *, int *, FILE **);

void initialise_board(void);
void free_board(void);
void print_board(FILE *);
void reset_board(FILE *);

void run_worker(int);

int random_strategy(int, FILE *, int *moves, int moves_size);
void legal_moves(int *, int *);
void make_move(int, int);

int minimax_alpha_beta(int *board, int my_colour, int depth, int alpha, int beta, int *best_move, int *sub_array, int sub_array_size, int *local_alpha, int *board_score, FILE *file);
int evaluate_board(int player, int my_colour, int *board, FILE *file);

int *board, *score_board;
int num_procs, my_colour;
int BOARD_SIZE;
FILE *fp;
int best_alpha = INT_MIN;

int main(int argc, char *argv[])
{
	int rank;

	if (argc != 6)
	{
		printf("Usage: %s <inetaddress> <port> <time_limit> <player_colour> <board_size>\n", argv[0]);
		return 1;
	}

	MPI_Init(&argc, &argv);
	MPI_Comm_rank(MPI_COMM_WORLD, &rank);
	// initialising rank and total number of processes
	MPI_Comm_size(MPI_COMM_WORLD, &num_procs);

	/* each process initialises their own board */
	BOARD_SIZE = atoi(argv[5]);
	initialise_board();

	if (rank == 0)
	{
		run_master(argc, argv);
	}
	else
	{
		run_worker(rank);
	}

	free_board();

	MPI_Finalize();
	return 0;
}

/**
 * Runs the master process.
 *
 * @param argc command line argument count
 * @param argv command line argument vector
 */
void run_master(int argc, char *argv[])
{
	int msg_type, time_limit, opp_move, running, number_of_moves;
	// FILE *fp;
	char *move;
	int *moves = malloc(sizeof(int) * MAX_MOVES);
	int best_move, best_score, sent_move, sent_score;

	running = initialise_master(argc, argv, &time_limit, &my_colour, &fp);

	while (running)
	{
		msg_type = receive_message(&opp_move);
		if (msg_type == GENERATE_MOVE)
		{											 /* referee is asking for a move */
			number_of_moves = 0;					 // number of legal moves
			moves = malloc(sizeof(int) * MAX_MOVES); // array storing legal moves

			// stores int number of- and array of- legal moves
			legal_moves(moves, &number_of_moves);
			// fprintf(fp, "Number of moves begining of round %d\n", number_of_moves);
			// fflush(fp);

			if (board[BOARD_SIZE * BOARD_SIZE / 2] == EMPTY)
			{
				best_move = BOARD_SIZE * BOARD_SIZE / 2;
				// fprintf(fp, "Board empty best move %d\n", best_move);
				// fflush(fp);
			}
			else
			{

				MPI_Bcast(board, 1, MPI_INT, 0, MPI_COMM_WORLD);

				int flag = 0, local_alpha = 0;

				best_score = 0;
				best_move = moves[0];
				MPI_Status status;

				int moves_received = 0, moves_sent = 0;
				MPI_Request requests[number_of_moves];

				while (moves_sent < num_procs - 1)
				{
					MPI_Send(&moves[moves_sent], 1, MPI_INT, moves_sent + 1, 0, MPI_COMM_WORLD);
					moves_sent++;
				}

				while (moves_received < number_of_moves)
				{
					// fprintf(fp, "Move %d\n\n", moves[moves_sent]);
					// fflush(fp);
					do
					{
						MPI_Iprobe(MPI_ANY_SOURCE, MPI_ANY_TAG, MPI_COMM_WORLD, &flag, &status);

					} while (!flag);

					if (flag)
					{
						MPI_Recv(&sent_score, 1, MPI_INT, status.MPI_SOURCE, 0, MPI_COMM_WORLD, &status);
						// fprintf(fp, "Received score %d from process %d\n", sent_score, status.MPI_SOURCE);
						// fflush(fp);

						MPI_Recv(&sent_move, 1, MPI_INT, status.MPI_SOURCE, 0, MPI_COMM_WORLD, &status);
						// fprintf(fp, "Received move %d from process %d\n", sent_move, status.MPI_SOURCE);
						fflush(fp);

						moves_received++;

						if (sent_score > best_score)
						{
							best_score = sent_score;
							best_move = sent_move;
						}

						if (moves_sent < number_of_moves)
						{
							MPI_Send(&moves[moves_sent], 1, MPI_INT, status.MPI_SOURCE, 0, MPI_COMM_WORLD);
							// fprintf(fp, "Send move %d to process %d\n\n", moves[moves_sent], status.MPI_SOURCE);
							// fflush(fp);
							moves_sent++;
						}
					}
				}

				int end = -1;
				for (int i = 1; i < num_procs; i++)
				{
					MPI_Send(&end, 1, MPI_INT, i, 0, MPI_COMM_WORLD);
					// fprintf(fp, "Send move %d to process %d\n\n", end, i);
					// fflush(fp);
				}
			}

			make_move(best_move, my_colour);
			fprintf(fp, "\nPlacing piece in row: %d column %d\n", best_move / BOARD_SIZE, best_move % BOARD_SIZE);
			fflush(fp);

			/* convert move to char */
			move = malloc(sizeof(char) * 10);
			sprintf(move, "%d\n", best_move);
			send_move(move);

			free(move);
		}
		else if (msg_type == PLAY_MOVE)
		{ /* referee is forwarding opponents move */

			fprintf(fp, "\nOpponent placing piece in row: %d column %d\n", opp_move / BOARD_SIZE, opp_move % BOARD_SIZE);
			make_move(opp_move, (my_colour + 1) % 2);

			legal_moves(moves, &number_of_moves);
			for (int i = 0; i < 5; i++)
			{
				fprintf(fp, "Legal moves after opponent plays row: %d column %d\n", moves[i] / BOARD_SIZE, moves[i] % BOARD_SIZE);
				fflush(fp);
			}
		}
		else if (msg_type == GAME_TERMINATION)
		{ /* reset the board */
			fprintf(fp, "Game terminated.\n");
			fflush(fp);
			running = 0;
		}
		else if (msg_type == MATCH_RESET)
		{ /* game is over */
			reset_board(fp);
		}
		else if (msg_type == UNKNOWN)
		{
			fprintf(fp, "Received unknown message type from referee.\n");
			fflush(fp);
			running = 0;
		}

		if (msg_type == GENERATE_MOVE || msg_type == PLAY_MOVE || msg_type == MATCH_RESET)
			print_board(fp);
	}
}

/**
 * Runs the worker process.
 *
 * @param rank rank of the worker process
 */
void run_worker(int rank)
{
	int running = 1;
	int count[num_procs], best_move = 0, best_score = 0, move = 0;
	bool movesLeft;

	FILE *file;

	char filename[25];
	snprintf(filename, sizeof(filename), "worker_%d.txt", rank);
	file = fopen(filename, "w");
	// fprintf(file, "In run worker.\n");
	// fflush(file);

	while (running)
	{

		MPI_Bcast(board, 1, MPI_INT, 0, MPI_COMM_WORLD);
		movesLeft = 1;

		while (movesLeft)
		{
			MPI_Recv(&move, 1, MPI_INT, 0, 0, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
			// fprintf(file, "Process %d received move %d.\n", rank, move);
			// fflush(file);

			if (move == -1)
			{
				movesLeft = 0;
				break;
			}

			// int shared_alpha = read_shared_alpha();
			int local_alpha, board_score;
			best_score = minimax_alpha_beta(board, my_colour, MAX_DEPTH, best_alpha, INT_MAX, &best_move, &move, 1, &local_alpha, &board_score, file);

			// Sends best score
			MPI_Send(&best_score, 1, MPI_INT, 0, 0, MPI_COMM_WORLD);

			// Sends best move
			MPI_Send(&best_move, 1, MPI_INT, 0, 0, MPI_COMM_WORLD);

			// fprintf(file, "Process %d best score %d.\n", rank, best_score);
			// fflush(file);
			// fprintf(file, "Process %d best move %d.\n\n", rank, best_move);
			// fflush(file);
		}
	}
	fclose(file);
}

/**
 * Resets the board to the initial state.
 *
 * @param fp pointer to the log file
 */
void reset_board(FILE *fp)
{

	fprintf(fp, "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
	fprintf(fp, "~~~~~~~~~~~~~ NEW MATCH ~~~~~~~~~~~~\n");
	fprintf(fp, "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
	free_board();
	initialise_board();

	fprintf(fp, "New board state:\n");
}

/**
 * Runs a random strategy. Chooses a random legal move and applies it to the board, then
 * returns the move in the form of an integer (0-361).
 *
 * @param my_colour colour of the player
 * @param fp pointer to the log file
 */
int random_strategy(int my_colour, FILE *fp, int *moves, int number_of_moves)
{
	srand(time(NULL));

	int random_index = rand() % number_of_moves;

	int move = moves[random_index];

	make_move(move, my_colour);

	free(moves);

	fprintf(fp, "\nPlacing piece in column: %d, row: %d \n", move / BOARD_SIZE, move % BOARD_SIZE);
	fflush(fp);

	return move;
}

/**
 * Applies the given move to the board.
 *
 * @param move move to apply
 * @param my_colour colour of the player
 */
void make_move(int move, int colour)
{
	board[move] = colour;
}

/**
 * Gets a list of legal moves for the current board, and stores them in the moves array followed by a -1.
 * Also stores the number of legal moves in the number_of_moves variable.
 *
 * @param moves array to store the legal moves in
 * @param number_of_moves variable to store the number of legal moves in
 */
void legal_moves(int *moves, int *number_of_moves)
{
	int i, j, k = 0;

	for (i = 0; i < BOARD_SIZE; i++)
	{
		for (j = 0; j < BOARD_SIZE; j++)
		{

			if (board[i * BOARD_SIZE + j] == EMPTY)
			{
				moves[k++] = i * BOARD_SIZE + j;
				(*number_of_moves)++;
			}
		}
	}

	moves[k] = -1;
}

/**
 * Initialises the board for the game.
 */
void initialise_board(void)
{
	board = malloc(sizeof(int) * BOARD_SIZE * BOARD_SIZE);
	memset(board, EMPTY, sizeof(int) * BOARD_SIZE * BOARD_SIZE);
}

/**
 * Prints the board to the given file with improved aesthetics.
 *
 * @param fp pointer to the file to print to
 */
void print_board(FILE *fp)
{
	fprintf(fp, "	");

	for (int i = 0; i < BOARD_SIZE; i++)
	{
		if (i < 9)
		{
			fprintf(fp, "%d  ", i + 1);
		}
		else
		{
			fprintf(fp, "%d ", i + 1);
		}
	}
	fprintf(fp, "\n");

	fprintf(fp, "   +");
	for (int i = 0; i < BOARD_SIZE; i++)
	{
		fprintf(fp, "--+");
	}
	fprintf(fp, "\n");

	for (int i = 0; i < BOARD_SIZE; i++)
	{
		fprintf(fp, "%2d |", i + 1);
		for (int j = 0; j < BOARD_SIZE; j++)
		{
			char piece = '.';
			if (board[i * BOARD_SIZE + j] == BLACK)
			{
				piece = 'B';
			}
			else if (board[i * BOARD_SIZE + j] == WHITE)
			{
				piece = 'W';
			}
			fprintf(fp, "%c  ", piece);
		}
		fprintf(fp, "|");
		fprintf(fp, "\n");
	}

	fprintf(fp, "   +");
	for (int i = 0; i < BOARD_SIZE; i++)
	{
		fprintf(fp, "--+");
	}
	fprintf(fp, "\n");

	fflush(fp);
}

/**
 * Frees the memory allocated for the board.
 */
void free_board(void)
{
	free(board);
}

/**
 * Initialises the master process for communication with the IF wrapper and set up the log file.
 * @param argc command line argument count
 * @param argv command line argument vector
 * @param time_limit time limit for the game
 * @param my_colour colour of the player
 * @param fp pointer to the log file
 * @return 1 if initialisation was successful, 0 otherwise
 */
int initialise_master(int argc, char *argv[], int *time_limit, int *my_colour, FILE **fp)
{
	unsigned long int ip = inet_addr(argv[1]);
	int port = atoi(argv[2]);
	*time_limit = atoi(argv[3]);
	*my_colour = atoi(argv[4]);

	printf("my colour is %d\n", *my_colour);

	/* open file for logging */
	*fp = fopen(PLAYER_NAME_LOG, "w");

	if (*fp == NULL)
	{
		printf("Could not open log file\n");
		return 0;
	}

	fprintf(*fp, "Initialising communication.\n");

	/* initialise comms to IF wrapper */
	if (!initialise_comms(ip, port))
	{
		printf("Could not initialise comms\n");
		return 0;
	}

	fprintf(*fp, "Communication initialised \n");

	fprintf(*fp, "Let the game begin...\n");
	fprintf(*fp, "My name: %s\n", PLAYER_NAME_LOG);
	fprintf(*fp, "My colour: %d\n", *my_colour);
	fprintf(*fp, "Board size: %d\n", BOARD_SIZE);
	fprintf(*fp, "Time limit: %d\n", *time_limit);
	fprintf(*fp, "-----------------------------------\n");
	print_board(*fp);

	fflush(*fp);

	return 1;
}

/**
 * Implements the Minimax algorithm with Alpha-Beta pruning to determine the best move for a player in a game.
 * This function recursively evaluates potential moves up to a specified depth or until the game reaches a terminal state.
 * It uses Alpha-Beta pruning to reduce the number of nodes evaluated in the minimax algorithm tree.
 *
 * @param game_board Current state of the game board as an array of integers.
 * @param player The current player's identifier (e.g., WHITE or BLACK).
 * @param depth The current depth of recursion; the function goes deeper based on this value until it reaches 1.
 * @param alpha The "alpha" value in alpha-beta pruning representing the best already explored option along the path to the root for the maximizer.
 * @param beta The "beta" value in alpha-beta pruning representing the best already explored option along the path to the root for the minimizer.
 * @param best_move Pointer to an integer where the best move's index will be stored.
 * @param moves Array of possible move indices that the current player can make.
 * @param number_of_moves Number of valid moves available for the player at current state.
 * @param local_alpah Pointer to an array or possibly unused integer, specific usage depends on broader context not shown in this snippet.
 * @param score_board A scoring array or a metric to evaluate the board; detailed usage depends on context.
 * @param file A file pointer for logging detailed execution traces or debug information.
 * @return The evaluation score of the board for the current player at the current depth. Higher scores are better for the maximizer, and lower scores are better for the minimizer.
 * @throws IllegalArgumentException if the move amount is not within valid range or if any other invalid parameter state is detected.
 */
int minimax_alpha_beta(int *game_board, int player, int depth, int alpha, int beta, int *best_move, int *moves, int number_of_moves, int *local_alpah, int *score_board, FILE *file)
{
	int score, best_score = EMPTY;

	// fprintf(fp, "Number of moves %d\n", number_of_moves);

	// check if winner is found at each depth
	// returns winner or empty if there is not winner
	if (depth <= 1)
	{
		return evaluate_board(player, my_colour, game_board, file);
		//  return check_win(player);
		//    return evaluate_last_move();
	}

	switch (player)
	{
	case WHITE:
	{
		// fprintf(fp, "White %d\n", number_of_moves);
		// fflush(fp);
		best_score = INT_MIN;

		for (int i = 0; i < number_of_moves; i++)
		{

			int board_copy[BOARD_SIZE * BOARD_SIZE];
			memcpy(board_copy, game_board, sizeof(int) * BOARD_SIZE * BOARD_SIZE);

			board_copy[moves[i]] = WHITE;

			int next_number_of_moves = 0;
			int *next_moves = malloc(sizeof(int) * MAX_MOVES);
			legal_moves(next_moves, &next_number_of_moves);

			score = minimax_alpha_beta(board_copy, BLACK, depth - 1, alpha, beta, best_move, next_moves, next_number_of_moves, local_alpah, score_board, file);

			// undoes move made to get score
			board_copy[moves[i]] = EMPTY;

			// if (depth == MAX_DEPTH)
			// {
			// 	// score = evaluate_last_move(WHITE, moves[i] / BOARD_SIZE, moves[i] % BOARD_SIZE, board_copy);
			// }

			if (score > best_score)
			{
				best_score = score;

				// if the max depth is reached and no one wins, loses or draw
				// sets the best move as the current move
				if (depth == MAX_DEPTH)
				{
					*best_move = moves[i];
				}
			}

			// alpha is player's best score
			if (score > alpha)
			{
				alpha = score;
			}

			/*  beta is opponent's best score
				if your opponents move is better than your move, prune
				that branch because you have better options to play
			*/
			if (beta <= alpha)
			{
				break;
			}
		}
		return best_score;
	}
	case BLACK:
	{
		// fprintf(fp, "Black %d\n", number_of_moves);
		// fflush(fp);
		best_score = INT_MAX;

		for (int i = 0; i < number_of_moves; i++)
		{
			int board_copy[BOARD_SIZE * BOARD_SIZE];
			memcpy(board_copy, game_board, sizeof(int) * BOARD_SIZE * BOARD_SIZE);

			board_copy[moves[i]] = BLACK;

			int next_number_of_moves = 0;
			int *next_moves = malloc(sizeof(int) * MAX_MOVES);
			legal_moves(next_moves, &next_number_of_moves);

			score = minimax_alpha_beta(board_copy, WHITE, depth - 1, alpha, beta, best_move, next_moves, next_number_of_moves, local_alpah, score_board, file);

			// undoes move made to get score
			board_copy[moves[i]] = EMPTY;

			// if (depth == MAX_DEPTH)
			// {
			// 	// score = evaluate_last_move(BLACK, moves[i] / BOARD_SIZE, moves[i] % BOARD_SIZE, board_copy);
			// }

			if (score < best_score)
			{
				best_score = score;

				// if the max depth is reached and no one wins, loses or draw
				// sets the best move as the current move
				if (depth == MAX_DEPTH)
				{
					*best_move = moves[i];
				}
			}

			if (score < beta)
			{
				beta = score;
			}

			if (beta <= alpha)
			{
				break;
			}
		}
		return best_score;
	}
	}

	return best_score;
}

/**
 * Evaluates the game board from the perspective of a specified player by calculating a score based on
 * the alignment and count of consecutive pieces. This function looks at all possible lines (horizontal,
 * vertical, and diagonal) from each cell to calculate a score that reflects potential winning positions.
 *
 * @param player The current player's identifier (e.g., 1 for player and 0 for opponent if binary identifiers are used).
 * @param my_colour The player's color or identifier. This parameter seems redundant given the 'player' parameter
 *                  and might be part of an unused or legacy code aspect unless it specifies something unique not evident here.
 * @param board Pointer to the start of the array representing the game board. Each cell of the board is assumed
 *              to be an integer representing the state at that position (e.g., 0 for empty, 1 for player one's piece, etc.).
 * @param file A file pointer for logging detailed execution traces or debug information. Useful for debugging or detailed output needs.
 * @return An integer score representing the evaluated state of the board. Higher scores indicate a more favorable position
 *         for the 'player', while lower scores indicate a more favorable position for the opponent.
 */
int evaluate_board(int player, int my_colour, int *board, FILE *file)
{
	// Initialize the score to 0
	int score = 0;

	// Determine the opponent's player index
	int opponent = (player + 1) % 2;

	// Define weights for different line configurations
	int weights[] = {1, 10, 100, 1000, 10000};

	// fprintf(file, "player %d\n opponent %d \n", player, opponent);
	// fflush(file);

	// Loop through each cell on the board
	for (int i = 0; i < BOARD_SIZE; i++)
	{
		for (int j = 0; j < BOARD_SIZE; j++)
		{
			// Loop through each direction around the current cell
			for (int dirRow = -1; dirRow <= 1; dirRow++)
			{
				for (int dirCol = -1; dirCol <= 1; dirCol++)
				{
					// Skip the case where both direction increments are 0 (current cell)
					if (dirRow == 0 && dirCol == 0)
						continue;

					// Initialize counters for player's and opponent's pieces in the current line
					int count_player = 0;
					int count_opponent = 0;

					// Loop through the line in the current direction
					for (int k = 1; k < K; k++)
					{
						// Calculate the coordinates of the next cell in the line
						int nextRow = i + k * dirRow;
						int nextCol = j + k * dirCol;

						// Check if the next cell is within the board boundaries
						if (nextRow < 0 || nextRow >= BOARD_SIZE || nextCol < 0 || nextCol >= BOARD_SIZE)
							break;

						// Get the piece at the next cell
						int piece = board[nextRow * BOARD_SIZE + nextCol];
						// fprintf(file, "row %d\n col %d value %d\n", nextRow, nextCol, piece);
						// fflush(file);

						// Update counters based on the piece at the next cell
						if (piece == player)
						{
							count_player++;
							fprintf(file, "player\n");
							fflush(file);
						}
						else if (piece == opponent)
						{
							count_opponent++;
							fprintf(file, "opponent\n");
							fflush(file);
						}
					}

					// Update the score based on the count of player's and opponent's pieces in the line
					score += weights[count_player] - weights[count_opponent];
				}
			}
		}
	}

	fprintf(file, "score %d\n", score);
	fflush(file);
	return score;
}
