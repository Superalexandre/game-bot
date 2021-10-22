import Home from "./Home.js"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

//https://www.digitalocean.com/community/tutorials/how-to-add-login-authentication-to-react-applications

function App() {
	return (
		<Router>
			<Switch>
				<Route path="/" exact component={Home} />
			</Switch>
		</Router>
	)
}

export default App