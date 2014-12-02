package eu.fusepool.p3.gui.pipeline;

import eu.fusepool.p3.gui.pipeline.client.HTTPClient;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

/**
 *
 * @author Gabor
 */
public class Transformers {

    public static List<Transformer> transformers;
    private static String pipelineBaseURI;

    public static void initialize(String uri) {
        pipelineBaseURI = uri;
    }

    public static void getInitData() {
        transformers = HTTPClient.getTransformers();
    }

    public static String getTransformers() {
        JSONObject response = new JSONObject();
        JSONArray transformerArray = new JSONArray();
        JSONArray pipelineArray = new JSONArray();

        JSONObject transformerObject;
        JSONObject pipelineObject;
        JSONArray pipelineObjectArray;
        try {
            for (Transformer transformer : transformers) {
                if (transformer instanceof Pipeline) {
                    Pipeline pipeline = (Pipeline) transformer;
                    pipelineObject = new JSONObject();
                    pipelineObject.put("name", pipeline.getTitle());
                    pipelineObject.put("description", pipeline.getDescription());
                    pipelineObject.put("uri", pipeline.getUri());

                    pipelineObjectArray = new JSONArray();
                    for (Transformer child : pipeline.getTransformers()) {
                        transformerObject = new JSONObject();
                        transformerObject.put("name", child.getTitle());
                        transformerObject.put("description", child.getDescription());
                        transformerObject.put("uri", child.getUri());
                        pipelineObjectArray.put(transformerObject);
                    }
                    pipelineObject.put("transformers", pipelineObjectArray);

                    pipelineArray.put(pipelineObject);

                }

                transformerObject = new JSONObject();
                transformerObject.put("name", transformer.getTitle());
                transformerObject.put("description", transformer.getDescription());
                transformerObject.put("uri", transformer.getUri());
                transformerArray.put(transformerObject);
            }

            response.put("transformers", transformerArray);
            response.put("pipelines", pipelineArray);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
        return response.toString();
    }

    public static void addPipeline(String name, String description, String selected) throws RuntimeException {
        Pipeline pipeline;
        List<Transformer> pipelineTransformers;
        JSONArray transformersJSONArray;
        String pipelineUri = pipelineBaseURI + "?";
        Transformer temp;
        try {
            pipelineTransformers = new ArrayList<>();
            transformersJSONArray = new JSONArray(selected);

            for (int i = 0; i < transformersJSONArray.length(); i++) {
                JSONObject transformer = transformersJSONArray.getJSONObject(i);
                if (i > 0) {
                    pipelineUri += "&";
                }
                pipelineUri += "t=" + URLEncoder.encode(transformer.getString("uri"), "UTF-8");

                temp = getTransformerByURI(transformer.getString("uri"));
                if (temp == null) {
                    throw new RuntimeException("Cannot find transformer with URI \"" + transformer.getString("name") + "\", it might have been deleted recently!");
                }
                pipelineTransformers.add(temp);
            }

            temp = getTransformerByURI(pipelineUri);
            if (temp != null) {
                throw new RuntimeException("This pipeline already exists under the name \"" + temp.getTitle() + "\"!");
            }

            if (description == null) {
                description = "";
            }

            pipeline = new Pipeline(name, description, pipelineUri);
            pipeline.setTransformers(pipelineTransformers);

            HTTPClient.postTransformer(pipeline);
            transformers = HTTPClient.getTransformers();

        } catch (JSONException | UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }

    public static void editPipeline(String name, String description, String uri, String selected) {
        List<Transformer> pipelineTransformers;
        JSONArray transformersJSONArray;
        String pipelineUri = pipelineBaseURI + "?";

        try {
            pipelineTransformers = new ArrayList<>();
            transformersJSONArray = new JSONArray(selected);

            for (int i = 0; i < transformersJSONArray.length(); i++) {
                JSONObject transformer = transformersJSONArray.getJSONObject(i);
                if (i > 0) {
                    pipelineUri += "&";
                }
                pipelineUri += "t=" + URLEncoder.encode(transformer.getString("uri"), "UTF-8");
                pipelineTransformers.add(new Transformer(transformer.getString("name"), transformer.getString("description"), transformer.getString("uri")));
            }

            if (!uri.equals(pipelineUri)) {
                Transformer temp = getTransformerByURI(pipelineUri);
                if (temp != null) {
                    throw new RuntimeException("This pipeline already exists under the name \"" + temp.getTitle() + "\"!");
                }
            }

        } catch (JSONException | UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Delete pipeline.
     *
     * @param uri
     */
    public static void deletePipeline(String uri) {
        Transformer deleted = getTransformerByURI(uri);
        if (deleted != null) {
            HTTPClient.deleteTransformer(deleted);
            transformers = HTTPClient.getTransformers();
        }
    }

    /**
     * Get transformer based on its URI.
     *
     * @param uri
     * @return
     */
    private static Transformer getTransformerByURI(String uri) {
        for (Transformer transformer : transformers) {
            if (transformer.getUri().equals(uri)) {
                return transformer;
            }
        }
        return null;
    }
}
