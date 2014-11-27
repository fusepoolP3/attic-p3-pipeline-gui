package eu.fusepool.p3.gui.pipeline;

import org.apache.clerezza.rdf.core.UriRef;

/**
 *
 * @author Gabor
 */
public class Container implements Comparable<Container> {

    private Integer index;
    private UriRef uri;

    public Container(UriRef uri) {
        index = 0;
        this.uri = uri;
    }

    public Container(Integer index, UriRef uri) {
        this.index = index;
        this.uri = uri;
    }

    public Integer getIndex() {
        return index;
    }

    public void setIndex(Integer index) {
        this.index = index;
    }

    public UriRef getUri() {
        return uri;
    }

    public String getUriString() {
        return uri.getUnicodeString();
    }

    public void setUri(UriRef uri) {
        this.uri = uri;
    }

    public void setUriString(String uri) {
        this.uri = new UriRef(uri);
    }

    @Override
    public int compareTo(Container o) {
        return this.index.compareTo(o.index);
    }

}
