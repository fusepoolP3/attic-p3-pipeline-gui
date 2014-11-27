package eu.fusepool.p3.gui.pipeline;

import org.apache.clerezza.rdf.core.UriRef;

/**
 *
 * @author Gabor
 */
public class Transformer implements Comparable<Transformer> {

    protected Container container;
    protected String title;
    protected String description;
    protected String uri;

    public Transformer() {
    }

    public Transformer(String title, String description, String uri) {
        this.title = title;
        this.description = description;
        this.uri = uri;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public Container getContainer() {
        return container;
    }

    public void setContainer(Container container) {
        this.container = container;
    }

    public void setContainer(UriRef containerURI) {
        this.container = new Container(containerURI);
    }

    public void setContainer(int index, UriRef containerURI) {
        this.container = new Container(index, containerURI);
    }

    public boolean hasContainer(Container container) {
        return this.container.getUriString().equals(container.getUriString());
    }

    @Override
    public String toString() {
        return "Transformer{" + "title=" + title + ", description=" + description + ", uri=" + uri + '}';
    }

    @Override
    public int compareTo(Transformer o) {
        return this.title.compareTo(o.title);
    }

}
