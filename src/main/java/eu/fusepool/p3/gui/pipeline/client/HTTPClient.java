package eu.fusepool.p3.gui.pipeline.client;

import eu.fusepool.p3.gui.pipeline.Container;
import eu.fusepool.p3.gui.pipeline.Pipeline;
import eu.fusepool.p3.gui.pipeline.Transformer;
import eu.fusepool.p3.gui.pipeline.turtle.Turtle;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 *
 * @author Gabor
 */
public class HTTPClient {

    private static String transformerRegistry;

    public static void initialize(String uri) {
        transformerRegistry = uri;
    }

    public static List<Transformer> getTransformers() {
        List<Container> containers = getContainers();
        List<Transformer> transformers = new ArrayList<>();
        for (Container container : containers) {
            transformers.add(getTransformer(container));
        }

        for (Transformer transformer : transformers) {
            if (transformer instanceof Pipeline) {
                Pipeline pipeline = (Pipeline) transformer;
                for (Container child : pipeline.getChilds()) {
                    pipeline.addTransformer(getTransformer(child));
                }
            }
        }

        Collections.sort(transformers);

        return transformers;
    }

    private static List<Container> getContainers() {
        HttpURLConnection httpConnection = null;
        try {
            URL url = new URL(transformerRegistry);
            // open connection
            httpConnection = (HttpURLConnection) url.openConnection();
            // set method to GET
            httpConnection.setRequestMethod("GET");
            // set accept, content-type to turtle
            httpConnection.setRequestProperty("Accept", "text/turtle");
            httpConnection.setRequestProperty("Content-Type", "text/turtle");
            // set timeout to 30 sec
            httpConnection.setReadTimeout(30 * 1000);
            // connect
            httpConnection.connect();
            // get the response
            InputStream response = httpConnection.getInputStream();
            // parse turtle response
            List<Container> containers = Turtle.getContainers(response);
            // return parsed reponse
            return containers;
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            if (httpConnection != null) {
                httpConnection.disconnect();
            }
        }
    }

    private static Transformer getTransformer(Container container) {
        HttpURLConnection httpConnection = null;
        try {
            URL url = new URL(container.getUriString());
            // open connection
            httpConnection = (HttpURLConnection) url.openConnection();
            // set method to GET
            httpConnection.setRequestMethod("GET");
            // set accept, content-type to turtle
            httpConnection.setRequestProperty("Accept", "text/turtle");
            httpConnection.setRequestProperty("Content-Type", "text/turtle");
            // set timeout to 30 sec
            httpConnection.setReadTimeout(30 * 1000);
            // connect
            httpConnection.connect();
            // get the response
            InputStream response = httpConnection.getInputStream();
            // parse turtle response
            Transformer transformer = Turtle.getTransformer(response);
            transformer.setContainer(container);
            // return parsed set
            return transformer;
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            if (httpConnection != null) {
                httpConnection.disconnect();
            }
        }
    }

    public static void postTransformer(Transformer transformer) {
        HttpURLConnection httpConnection = null;
        try {
            URL url = new URL(transformerRegistry);
            // open connection
            httpConnection = (HttpURLConnection) url.openConnection();
            // set method to POST
            httpConnection.setRequestMethod("POST");
            // set accept, content-type to turtle
            httpConnection.setRequestProperty("Content-Type", "text/turtle");
            // set charset encoding
            httpConnection.setRequestProperty("charset", "utf-8");
            // set timeout to 30 sec
            httpConnection.setReadTimeout(30 * 1000);
            // set connection for input and output
            httpConnection.setDoInput(true);
            httpConnection.setDoOutput(true);
            // do not use cache
            httpConnection.setUseCaches(false);
            // convert transformer object to turtle
            ByteArrayOutputStream baos = Turtle.convertTo(transformer);
            // setting content length
            httpConnection.setRequestProperty("Content-Length", "" + Integer.toString(baos.size()));

            // write output
            try (OutputStream out = httpConnection.getOutputStream()) {
                out.write(baos.toByteArray());
                out.flush();
            }

            // checking response code
            if (HttpURLConnection.HTTP_OK != httpConnection.getResponseCode()
                    && HttpURLConnection.HTTP_CREATED != httpConnection.getResponseCode()) {
                throw new RuntimeException("Post request to transformer registry returned statuscode: " + httpConnection.getResponseCode());
            }

        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            if (httpConnection != null) {
                httpConnection.disconnect();
            }
        }
    }

    public static void deleteTransformer(Transformer transformer) {
        HttpURLConnection httpConnection = null;
        try {
            URL url = new URL(transformer.getContainer().getUriString());
            // open connection
            httpConnection = (HttpURLConnection) url.openConnection();
            // set method to DELETE
            httpConnection.setRequestMethod("DELETE");
            // set timeout to 30 sec
            httpConnection.setReadTimeout(30 * 1000);
            // connect
            httpConnection.connect();

            // checking response code
            if (HttpURLConnection.HTTP_OK != httpConnection.getResponseCode()
                    && HttpURLConnection.HTTP_NO_CONTENT != httpConnection.getResponseCode()) {
                throw new RuntimeException("Delete request to transformer registry returned statuscode: " + httpConnection.getResponseCode());
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            if (httpConnection != null) {
                httpConnection.disconnect();
            }
        }
    }

}
