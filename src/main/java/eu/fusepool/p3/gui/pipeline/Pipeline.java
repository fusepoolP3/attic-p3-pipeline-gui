/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package eu.fusepool.p3.gui.pipeline;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author Gabor
 */
public class Pipeline extends Transformer{
    
    private List<Transformer> transformers;
    
    public Pipeline(String name, String uri) {
        super(name, uri);
        
        transformers = new ArrayList<>();
    }

    public List<Transformer> getTransformers() {
        return transformers;
    }
    
    public void addTransformer(Transformer transformer){
        transformers.add(transformer);
    }
    
    public void removeTransformer(Transformer transformer){
        transformers.remove(transformer);
    }

    public void setTransformers(List<Transformer> transformers) {
        this.transformers = transformers;
    }
    
}
