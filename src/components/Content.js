import React from "react";
import {
    Switch,
    Route,    
} from "react-router-dom";
import Home from './pages/Home';
import About from './pages/About';

export default function Content () {

    return(
        <>
            <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/about" component={About} />
            </Switch>
        </>
    );

} 
