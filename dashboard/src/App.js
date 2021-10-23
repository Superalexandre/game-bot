import Home from "./pages/Home.js"
import Login from "./pages/Login.js"
import { Component } from "react"
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom"

//https://www.digitalocean.com/community/tutorials/how-to-add-login-authentication-to-react-applications

class App extends Component {
	render() {	
		return (
			<Router>
				<Switch>
					<Route path="/" exact component={Home} />
					<Route path="/login" component={Login} />

					<Redirect to="/" />
				</Switch>
			</Router>
		)
	}
}

export default App