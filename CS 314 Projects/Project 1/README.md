## Overview

This program simulates process scheduling and resource management in an operating system environment. It provides implementations for various scheduling algorithms including Preemptive Priority, and First-Come, First-Served (FCFS). Additionally, it handles resource allocation and release.

## Files

- `proc_structs.h`: Header file defining process and resource structures.
- `proc_syntax.h`: Header file defining instruction syntax.
- `logger.h`: Header file for logging functions.
- `manager.h`: Header file containing function declarations for process management.

## Scheduling Algorithms

### Priority Based Scheduler with Preemption (`schedule_pri_w_pre`)

Prioritizes processes based on their priority values and preempts lower-priority processes when higher-priority ones arrive.

### First-Come, First-Served (FCFS) (`schedule_fcfs`)

Non-preemptive scheduling algorithm that executes processes in the order they arrive.


## Utilities

- `get_init_data`: Retrieves process file name or "generator" from command-line arguments.
- `get_data`: Retrieves additional process file name or "generator" from command-line arguments.
- `get_algo`: Retrieves the chosen scheduling algorithm from command-line arguments.
- `get_time_quantum`: Retrieves the time quantum for Round Robin scheduling from command-line arguments.
- `print_args`: Prints the program's command-line arguments.
- `print_avail_resources`: Prints available global resources.
- `print_alloc_resources`: Prints resources allocated to a process.
- `print_queue`: Prints processes in a queue.
- `print_running`: Prints the currently running process.
- `print_instructions`: Prints a linked list of instructions.

## Usage

./schedule_processes [data1] [data2] [scheduler] [time_quantum]

- `data1`: Name of the first process file or "generator".
- `data2`: Name of the second process file or "generator".
- `scheduler`: Scheduling algorithm (0 for Priority, 1 for Round Robin, 2 for FCFS).
- `time_quantum`: Time quantum for Round Robin scheduling (if applicable).

