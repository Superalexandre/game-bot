import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import Modal from "./components/Modal/index"

function App() {
	const [modalOpen, setModelOpen] = useState(false)

	const close = () => setModelOpen(false)
	const open = () => setModelOpen(true)

	return (
		<div>
			<motion.button
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
				className="button"
				onClick={() => (modalOpen ? close() : open())}
			>
				Button test
			</motion.button>

			<AnimatePresence
				initial={false}
				exitBeforeEnter={true}
			>
				{modalOpen && <Modal modalOpen={modalOpen} handleClose={close}/>}
			</AnimatePresence>
		</div>
    )
}

export default App
