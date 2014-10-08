package eu.fusepool.p3.gui.pipeline.servlet;

import eu.fusepool.p3.gui.pipeline.temporary.StaticData;
import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

@Path("resources")
public class Resources {

    public Resources() {
    }

    @GET
    @Path("/test")
    @Produces("text/plain")
    public String test() {
        return "Hello world!";
    }

    @GET
    @Path("/get")
    @Produces("application/json")
    public String get() {
        return StaticData.getResponse();
    }

    @POST
    @Path("/add")
    @Consumes("application/x-www-form-urlencoded; charset=UTF-8")
    @Produces("text/plain")
    public String add(@FormParam("name") String name, @FormParam("selected") String selected) {
        try {
            StaticData.addPipeline(name, selected);
            return "OK";
        } catch (RuntimeException e) {
            return e.getMessage();
        }
    }

    @POST
    @Path("/edit")
    @Consumes("application/x-www-form-urlencoded; charset=UTF-8")
    @Produces("text/plain")
    public String edit(@FormParam("name") String name, @FormParam("uri") String uri, @FormParam("selected") String selected) {
        try {
            StaticData.editPipeline(name, uri, selected);
            return "OK";
        } catch (RuntimeException e) {
            return e.getMessage();
        }
    }

    @POST
    @Path("/delete")
    @Consumes("application/x-www-form-urlencoded; charset=UTF-8")
    @Produces("text/plain")
    public String delete(@FormParam("uri") String uri) {
        try {
            StaticData.deletePipeline(uri);
            return "OK";
        } catch (RuntimeException e) {
            return e.getMessage();
        }
    }
}
