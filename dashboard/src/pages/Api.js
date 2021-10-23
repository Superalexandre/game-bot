import { Component } from "react";
import  { Redirect } from 'react-router-dom'

class Api extends Component {
    loginDiscord({ code }) {
        fetch(`http://localhost:5000/api/callback/discord?code=${code}`, {
            crossDomain: true
        })
            .then(res => res.text())
            .then(console.log)
            .catch(() => {})
    }

    render() {
        const pathName = this.props.location.pathname.split("/")
        const query = new URLSearchParams(this.props.location.search)

        if (pathName[2] !== "callback") return <Redirect to="/login" />

        if (pathName[2] === "callback" && pathName[3] === "discord") {
            //console.log(query.get("code"))
            
            const user = this.loginDiscord({ code: query.get("code") })

            console.log(user)

            return (
                <div>
                    <p>Ne bougez pas vous allez être rediriger sinon :</p>
                    <a href="/login">Cliquez ici</a>
                </div>
            )
        }

        if (pathName[2] === "callback" && pathName[3] === "instagram") {
            return <Redirect to="/login?plateform=instagram" />
        }

        return <Redirect to="/login?error=invalid_path" />
    }
}

export default Api