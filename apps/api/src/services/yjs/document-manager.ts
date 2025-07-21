import * as Y from 'yjs'

const docs = new Map<string, Y.Doc>()

export class DocumentManager {
	static getDocument(roomName: string): Y.Doc | undefined {
		return docs.get(roomName)
	}

	static createDocument(roomName: string): Y.Doc {
		const doc = new Y.Doc()
		docs.set(roomName, doc)
		return doc
	}

	static deleteDocument(roomName: string): boolean {
		const doc = docs.get(roomName)
		if (doc) {
			doc.destroy()
			docs.delete(roomName)
			return true
		}
		return false
	}

	static getOrCreateDocument(roomName: string): Y.Doc {
		let doc = docs.get(roomName)
		if (!doc) {
			doc = new Y.Doc()
			docs.set(roomName, doc)
		}
		return doc
	}
} 