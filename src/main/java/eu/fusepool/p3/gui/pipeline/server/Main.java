package eu.fusepool.p3.gui.pipeline.server;

import eu.fusepool.p3.gui.pipeline.Transformers;
import eu.fusepool.p3.gui.pipeline.client.HTTPClient;
import java.util.Map;
import org.apache.commons.lang.StringUtils;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.webapp.WebAppContext;
import org.wymiwyg.commons.util.arguments.ArgumentHandler;

/**
 *
 * @author Gabor
 */
public class Main {

    public static void main(String[] args) throws Exception {
        Arguments arguments = ArgumentHandler.readArguments(Arguments.class, args);
        if (arguments != null) {
            start(arguments);
        }
    }

    private static void start(Arguments arguments) throws Exception {
        String transformerRegistry = arguments.getTransformerRegistry();
        String pipelineBase = arguments.getPipelineBase();

        Map<String, String> env = System.getenv();

        if (StringUtils.isBlank(transformerRegistry)) {
            transformerRegistry = env.get("P3_TR_LDPC");
            if (StringUtils.isBlank(transformerRegistry)) {
                throw new RuntimeException("Transformer registry URI must be supplied either as commandline argument or environmental variable.");
            }
        }
        HTTPClient.initialize(transformerRegistry);

        if (StringUtils.isBlank(pipelineBase)) {
            pipelineBase = env.get("P3_PL_URI");
            if (StringUtils.isBlank(pipelineBase)) {
                throw new RuntimeException("Pipeline transformer base URI must be supplied either as commandline argument or environmental variable.");
            }
        }
        Transformers.initialize(pipelineBase);

        Server server = new Server(arguments.getPort());

        WebAppContext webAppContext = new WebAppContext("./src/main/webapp", "/");
        webAppContext.setLogUrlOnStart(true);
        webAppContext.setWelcomeFiles(new String[]{"index.html"});
        webAppContext.configure();

        server.setHandler(webAppContext);

        server.start();
        server.join();
    }
}
