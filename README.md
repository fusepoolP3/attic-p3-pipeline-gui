Pipeline GUI
===============

A simple user interface for creating and testing pipelines.

###Install and run

Clone the repository to your local machine

    git clone https://github.com/fusepoolP3/p3-pipeline-gui.git

Compile the application with

    mvn clean install

Start the application with

    mvn exec:java

Or start the application with parameters (`-P` sets the port)

    mvn exec:java -Dexec.args="-P 8100"

###Usage

In a browser go to [http://localhost:8100/](http://localhost:8100/)
