/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { createBlog } from './graphql/mutations'
import { listBlogs } from './graphql/queries'
import { withAuthenticator } from '@aws-amplify/ui-react'

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '' }

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    fetchBlogs()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchBlogs() {
    try {
      const blogData = await API.graphql(graphqlOperation(listBlogs))
      const blogs = blogData.data.listBlogs.items
      setBlogs(blogs)
    } catch (err) { console.log('error fetching blogs') }
  }

  async function addBlog() {
    try {
      if (!formState.name ) return
      const blog = { ...formState }
      setBlogs([...blogs, blog])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createBlog, {input: blog}))
    } catch (err) {
      console.log('error creating blog:', err)
    }
  }

  return (
    <div style={styles.container}>
      <h2>Amplify Blogs</h2>
      <input
        onChange={event => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <button style={styles.button} onClick={addBlog}>Create Blog</button>
      {
        blogs.map((blog, index) => (
          <div key={blog.id ? blog.id : index} style={styles.blog}>
            <p style={styles.blogName}>{blog.name}</p>
          </div>
        ))
      }
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  blog: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  blogName: { fontSize: 20, fontWeight: 'bold' },
  blogDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default withAuthenticator(App)