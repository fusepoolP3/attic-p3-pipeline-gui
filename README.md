# Pipeline GUI [![Build Status](https://travis-ci.org/fusepoolP3/p3-pipeline-gui.svg)](https://travis-ci.org/fusepoolP3/p3-pipeline-gui)
Pipeline GUI provides a user interface that allows an easy way to create pipeline transformers by clicking the available transformers together in a list.

All available transformers inluding the pipelines are stored in an LDP container called Transformer Registry. This interface allows users to add new pipeline transformers to or delete existing ones from the registry. In addition it also provides an interface to invoke pipelines with data.

## Compiling and Running

Compile the source code and start the application with

    mvn clean install exec:java -Dexec.args="-P <port>"

`-P` sets the port (optional)

## Usage

Open a browser go to [http://localhost:8201/](http://localhost:8201/)

Specify the query parameters `platformURI` and `transformerBase` to define the URI of the P3 platform as well as the base URI of the Pipeline Transformer Service.
