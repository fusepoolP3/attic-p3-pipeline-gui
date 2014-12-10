Pipeline GUI
===============

Pipeline GUI provides a user interface that allows an easy way to create pipeline factory instances by clicking the available transformers together in a list.

All available transformers and pipelines are stored in an LDP container called Transformer Registry. This interface allows users to add new pipeline instances to or delete existing ones from the registry. In addition it also provides an interface to invoke pipelines with data.

The URI of the Transformer Registry and the base URI of the [Pipeline Transformer](https://github.com/fusepoolP3/p3-pipeline-transformer) must be supplied either as environmental variable or as commandline arguments. (See the Install and run section)

###Install and run

Create the following two environmental variables (optional)

    P3_TR_LDPC - URI of the Transformer Registry (i.e. http://sandbox.fusepool.info:8181/ldp/tr-ldpc)
    P3_PL_URI - base URI of the Pipeline Transformer (i.e. http://sandbox.fusepool.info:8191/)
    
Compile the source code and start the application with

    mvn clean install exec:java -Dexec.args="-TR <transformer_regstry_uri> -PL <pipeline_transformer_base_uri> -P <port>"

`-TR` URI of the Transformer Registry (required if not set as environmental variable)
`-PL` base URI of the Pipeline Transformer (required if not set as environmental variable)
`-P` sets the port (optional)

###Usage

In a browser go to [http://localhost:8100/](http://localhost:8100/)
