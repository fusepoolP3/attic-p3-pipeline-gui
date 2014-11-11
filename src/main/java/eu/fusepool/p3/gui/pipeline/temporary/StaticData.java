package eu.fusepool.p3.gui.pipeline.temporary;

import eu.fusepool.p3.gui.pipeline.Pipeline;
import eu.fusepool.p3.gui.pipeline.Transformer;
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
public class StaticData {

    public static List<Pipeline> pipelines;
    public static List<Transformer> transformers;
    public static String pipelineBaseURI = "http://localhost:7100/";

    public static void initialize() {
        pipelines = new ArrayList<>();

        Pipeline temp = new Pipeline("Pipeline HU NASA", "http://localhost:7100/?t=http%3A%2F%2Flocalhost%3A7101%2F%3Ffrom%3Dhu%26to%3Den&t=http%3A%2F%2Flocalhost%3A7102%2F%3Ftaxonomy%3Dhttp%3A%2F%2F82.141.158.251%3A85%2Fmytaxonomies%2FNASA.subjects.skos.xml");
        temp.addTransformer(new Transformer("Bing Translate HU-EN", "http://localhost:7101/?from=hu&to=en"));
        temp.addTransformer(new Transformer("Dictionary Matcher NASA", "http://localhost:7102/?taxonomy=http://82.141.158.251:85/mytaxonomies/NASA.subjects.skos.xml"));
        pipelines.add(temp);

        temp = new Pipeline("Pipeline DE NASA", "http://localhost:7100/?t=http%3A%2F%2Flocalhost%3A7101%2F%3Ffrom%3Dde%26to%3Den&t=http%3A%2F%2Flocalhost%3A7102%2F%3Ftaxonomy%3Dhttp%3A%2F%2F82.141.158.251%3A85%2Fmytaxonomies%2FNASA.subjects.skos.xml");
        temp.addTransformer(new Transformer("Bing Translate DE-EN", "http://localhost:7101/?from=de&to=en"));
        temp.addTransformer(new Transformer("Dictionary Matcher NASA", "http://localhost:7102/?taxonomy=http://82.141.158.251:85/mytaxonomies/NASA.subjects.skos.xml"));
        pipelines.add(temp);

        transformers = new ArrayList<>();
        transformers.add(new Transformer("Bing Translate DE-EN", "http://localhost:7101/?from=de&to=en"));
        transformers.add(new Transformer("Bing Translate HU-EN", "http://localhost:7101/?from=hu&to=en"));
        transformers.add(new Transformer("Bing Translate IT-EN", "http://localhost:7101/?from=it&to=en"));
        transformers.add(new Transformer("Dictionary Matcher NASA", "http://localhost:7102/?taxonomy=http://82.141.158.251:85/mytaxonomies/NASA.subjects.skos.xml"));
        transformers.add(new Transformer("Dictionary Matcher Products", "http://localhost:7102/?taxonomy=http://82.141.158.251:85/mytaxonomies/Products.owl"));
    }

    public static String getResponse() {
        JSONObject response = new JSONObject();
        JSONArray transformerArray = new JSONArray();
        JSONArray pipelineArray = new JSONArray();

        JSONObject transformerObject;
        JSONObject pipelineObject;
        JSONArray pipelineObjectArray;
        try {
            for (Transformer transformer : transformers) {
                transformerObject = new JSONObject();
                transformerObject.put("name", transformer.getName());
                transformerObject.put("uri", transformer.getUri());
                transformerArray.put(transformerObject);
            }

            for (Pipeline pipeline : pipelines) {
                pipelineObject = new JSONObject();
                pipelineObject.put("name", pipeline.getName());
                pipelineObject.put("uri", pipeline.getUri());

                pipelineObjectArray = new JSONArray();
                for (Transformer transformer : pipeline.getTransformers()) {
                    transformerObject = new JSONObject();
                    transformerObject.put("name", transformer.getName());
                    transformerObject.put("uri", transformer.getUri());
                    pipelineObjectArray.put(transformerObject);
                }
                pipelineObject.put("transformers", pipelineObjectArray);

                pipelineArray.put(pipelineObject);
            }
            response.put("transformers", transformerArray);
            response.put("pipelines", pipelineArray);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
        return response.toString();
    }

    public static void addPipeline(String name, String selected) throws RuntimeException {
        Pipeline pipeline;
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
                pipelineUri += "t=" + URLEncoder.encode(transformer.getString("uri"));
                pipelineTransformers.add(new Transformer(transformer.getString("name"), transformer.getString("uri")));
            }

            Pipeline temp = getPipeline(pipelineUri);
            if (temp != null) {
                throw new RuntimeException("This pipeline already exists under the name \"" + temp.getName() + "\"!");
            }

            pipeline = new Pipeline(name, pipelineUri);
            pipeline.setTransformers(pipelineTransformers);
            pipelines.add(pipeline);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    public static void editPipeline(String name, String uri, String selected) {
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
                pipelineUri += "t=" + URLEncoder.encode(transformer.getString("uri"));
                pipelineTransformers.add(new Transformer(transformer.getString("name"), transformer.getString("uri")));
            }

            if (!uri.equals(pipelineUri)) {
                Pipeline temp = getPipeline(pipelineUri);
                if (temp != null) {
                    throw new RuntimeException("This pipeline already exists under the name \"" + temp.getName() + "\"!");
                }
            }

            for (int i = 0; i < pipelines.size(); i++) {
                Pipeline temp = pipelines.get(i);
                if (temp.getUri().equals(uri)) {
                    temp.setName(name);
                    temp.setUri(pipelineUri);
                    temp.setTransformers(pipelineTransformers);
                    pipelines.set(i, temp);
                    break;
                }
            }

        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    public static void deletePipeline(String uri) {
        Pipeline deleted = null;
        for (Pipeline pipeline : pipelines) {
            if (pipeline.getUri().equals(uri)) {
                deleted = pipeline;
                break;
            }
        }

        if (deleted != null) {
            pipelines.remove(deleted);
        } else {
            throw new RuntimeException("Failed to delete pipeline!");
        }
    }

    private static Pipeline getPipeline(String uri) {
        for (Pipeline pipeline : pipelines) {
            if (pipeline.getUri().equals(uri)) {
                return pipeline;
            }
        }
        return null;
    }
}
