package eu.fusepool.p3.gui.pipeline.turtle;

import eu.fusepool.p3.gui.pipeline.Container;
import eu.fusepool.p3.gui.pipeline.Pipeline;
import eu.fusepool.p3.gui.pipeline.Transformer;
import eu.fusepool.p3.gui.pipeline.turtle.prefixes.DCT;
import eu.fusepool.p3.gui.pipeline.turtle.prefixes.LDP;
import eu.fusepool.p3.gui.pipeline.turtle.prefixes.TRLDPC;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;
import org.apache.clerezza.rdf.core.Graph;
import org.apache.clerezza.rdf.core.Literal;
import org.apache.clerezza.rdf.core.NonLiteral;
import org.apache.clerezza.rdf.core.Triple;
import org.apache.clerezza.rdf.core.TripleCollection;
import org.apache.clerezza.rdf.core.UriRef;
import org.apache.clerezza.rdf.core.impl.SimpleMGraph;
import org.apache.clerezza.rdf.core.serializedform.Parser;
import org.apache.clerezza.rdf.core.serializedform.Serializer;
import org.apache.clerezza.rdf.core.serializedform.SupportedFormat;
import org.apache.clerezza.rdf.ontologies.RDF;
import org.apache.clerezza.rdf.utils.GraphNode;

/**
 *
 * @author Gabor
 */
public class Turtle {

    /**
     * Convert a single Transformer object to graph.
     *
     * @param transformer
     * @return
     */
    public static ByteArrayOutputStream convertTo(Transformer transformer) {
        TripleCollection triples = new SimpleMGraph();

        GraphNode node = new GraphNode(new UriRef(""), triples);
        node.addProperty(RDF.type, TRLDPC.TransformerRegistration);
        node.addProperty(TRLDPC.transformer, new UriRef(transformer.getUri()));
        node.addPropertyValue(DCT.title, transformer.getTitle());
        node.addPropertyValue(DCT.description, transformer.getDescription());

        if (transformer instanceof Pipeline) {
            Pipeline pipeline = (Pipeline) transformer;
            for (Transformer childs : pipeline.getTransformers()) {
                node.addProperty(LDP.contains, childs.getContainer().getUri());
                node.addPropertyValue(childs.getContainer().getUri(), childs.getContainer().getIndex());
            }
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Serializer.getInstance().serialize(baos, triples, SupportedFormat.TURTLE);

        return baos;
    }

    /**
     * Get a list of containers from turtle.
     *
     * @param data
     * @return
     */
    public static List<Container> getContainers(InputStream data) {
        final Graph graph = Parser.getInstance().parse(data, "text/turtle");
        Iterator<Triple> basicContainer = graph.filter(null, null, LDP.BasicContainer);
        if (!basicContainer.hasNext()) {
            throw new RuntimeException("ERROR: No triple found with " + LDP.BasicContainer);
        }

        NonLiteral subject = basicContainer.next().getSubject();
        Iterator<Triple> triples = graph.filter(subject, null, null);

        List<Container> containers = new ArrayList<>();

        while (triples.hasNext()) {
            Triple triple = triples.next();

            if (LDP.contains.equals(triple.getPredicate())) {
                UriRef containerURI = (UriRef) triple.getObject();
                containers.add(new Container(containerURI));
            }

        }

        return containers;
    }

    /**
     * Get Transformer object from turtle.
     *
     * @param data
     * @return
     */
    public static Transformer getTransformer(InputStream data) {
        final Graph graph = Parser.getInstance().parse(data, "text/turtle");
        Iterator<Triple> transformerRegistrations = graph.filter(null, null, TRLDPC.TransformerRegistration);
        if (!transformerRegistrations.hasNext()) {
            throw new RuntimeException("ERROR: No triple found with " + TRLDPC.TransformerRegistration);
        }

        Transformer transformer;

        Iterator<Triple> contains = graph.filter(null, LDP.contains, null);
        if (contains.hasNext()) {
            Pipeline temp = new Pipeline();
            while (contains.hasNext()) {
                Triple triple = contains.next();
                UriRef childURI = (UriRef) triple.getObject();

                Iterator<Triple> indexes = graph.filter(null, childURI, null);
                if (!indexes.hasNext()) {
                    throw new RuntimeException("ERROR: No triple found with " + childURI);
                }
                triple = indexes.next();
                Literal index = (Literal) triple.getObject();
                temp.addChild(new Container(Integer.parseInt(index.getLexicalForm()), childURI));
            }
            transformer = temp;
        } else {
            transformer = new Transformer();
        }

        NonLiteral subject = transformerRegistrations.next().getSubject();
        Iterator<Triple> triples = graph.filter(subject, null, null);

        while (triples.hasNext()) {
            Triple triple = triples.next();

            if (DCT.title.equals(triple.getPredicate())) {
                Literal title = (Literal) triple.getObject();
                transformer.setTitle(title.getLexicalForm());
            }

            if (DCT.description.equals(triple.getPredicate())) {
                Literal description = (Literal) triple.getObject();
                transformer.setDescription(description.getLexicalForm());
            }

            if (TRLDPC.transformer.equals(triple.getPredicate())) {
                UriRef uri = (UriRef) triple.getObject();
                transformer.setUri(uri.getUnicodeString());
            }

        }

        return transformer;
    }

    private static String getRandomURI() {
        return UUID.randomUUID().toString();
    }
}
