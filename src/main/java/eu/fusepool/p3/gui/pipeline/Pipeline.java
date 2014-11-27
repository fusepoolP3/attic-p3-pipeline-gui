package eu.fusepool.p3.gui.pipeline;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.apache.commons.lang.StringUtils;

/**
 *
 * @author Gabor
 */
public class Pipeline extends Transformer {

    private List<Transformer> transformers;
    private List<Container> childs;

    public Pipeline() {
        super();
        transformers = new ArrayList<>();
        childs = new ArrayList<>();
    }

    public Pipeline(String title, String description, String uri) {
        super(title, description, uri);
        transformers = new ArrayList<>();
        childs = new ArrayList<>();
    }

    public void addChild(Container container) {
        childs.add(container);
        Collections.sort(childs);
    }

    public List<Container> getChilds() {
        return childs;
    }

    public List<Transformer> getTransformers() {
        return transformers;
    }

    public void addTransformer(Transformer transformer) {
        transformers.add(transformer);
    }

    public void removeTransformer(Transformer transformer) {
        transformers.remove(transformer);
    }

    public void setTransformers(List<Transformer> transformers) {
        this.transformers = transformers;
    }

    private void parseQueryString() {
        try {
            String[] splitted = uri.split("\\?", 2);
            String queryString = splitted[1];
            // query string should not be empty or blank
            if (StringUtils.isNotBlank(queryString)) {
                String[] params = queryString.split("&");
                String[] param;
                for (String item : params) {
                    param = item.split("=", 2);
                    String value = URLDecoder.decode(param[1], "UTF-8");
                }
            }
        } catch (ArrayIndexOutOfBoundsException | UnsupportedEncodingException e) {
            throw new RuntimeException("ERROR: Failed to parse query string!", e);
        }
    }

}
