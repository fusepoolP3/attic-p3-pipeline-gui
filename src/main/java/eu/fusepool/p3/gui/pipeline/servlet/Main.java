package eu.fusepool.p3.gui.pipeline.servlet;

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
