/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package eu.fusepool.p3.gui.pipeline.servlet;

import eu.fusepool.p3.gui.pipeline.temporary.StaticData;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

/**
 *
 * @author Gabor
 */
@WebListener
public class AppContextListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("Context Initialized!");
        StaticData.initialize();
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("Context Destroyed!");
    }
    
}
