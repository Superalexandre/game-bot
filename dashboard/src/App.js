import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import Modal from "./components/Modal/index"

function App() {
	const [modalOpen, setModelOpen] = useState(false)

	const closeModel = () => setModelOpen(false)
	const openModel = () => setModelOpen(true)

	return (
		<div>
			<motion.button
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
				className="button"
				onClick={() => (modalOpen ? closeModel() : openModel())}
			>
				Button test
			</motion.button>

			<AnimatePresence
				initial={false}
				exitBeforeEnter={true}
			>
				{modalOpen && <Modal modalOpen={modalOpen} handleClose={closeModel}/>}
			</AnimatePresence>
		</div>
    )
}

export default App
