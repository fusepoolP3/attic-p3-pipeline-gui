/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package eu.fusepool.p3.gui.pipeline;

/**
 *
 * @author Gabor
 */
public class Transformer {
    private String name;
    private String uri;

    public Transformer(String name, String uri) {
        this.name = name;
        this.uri = uri;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    @Override
    public String toString() {
        return "Transformer{" + "name=" + name + ", uri=" + uri + '}';
    }
    
}
