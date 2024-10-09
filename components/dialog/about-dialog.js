import Dialog from 'components/dialog'
import About from 'components/about'

export default ({ toggle }) => {
  return (
    <Dialog title='About' toggle={toggle}>
      <About toggle={toggle} />
    </Dialog>
  )
}
