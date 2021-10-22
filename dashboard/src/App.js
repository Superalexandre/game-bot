import Home from "./Home.js"
import Login from "./Login.js"
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom"

//https://www.digitalocean.com/community/tutorials/how-to-add-login-authentication-to-react-applications

function App() {
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

export default App