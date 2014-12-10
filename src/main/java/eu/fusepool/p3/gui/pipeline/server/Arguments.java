package eu.fusepool.p3.gui.pipeline.server;

import org.wymiwyg.commons.util.arguments.ArgumentsWithHelp;
import org.wymiwyg.commons.util.arguments.CommandLine;

/**
 *
 * @author Gabor
 */
public interface Arguments extends ArgumentsWithHelp {

    @CommandLine(longName = "port", shortName = {"P"}, required = false,
            defaultValue = "8100",
            description = "The port on which the proxy shall listen")
    public int getPort();

    @CommandLine(longName = "transformer-registry", shortName = {"TR"}, required = false,
            description = "The URI of the transformer-registry container")
    public String getTransformerRegistry();

    @CommandLine(longName = "pipeline-base", shortName = {"PL"}, required = false,
            description = "The base URI of the pipeline transformer")
    public String getPipelineBase();
}
