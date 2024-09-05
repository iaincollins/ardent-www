export default function TabOptions() {
  return (
    <div className='tab-tab_options'>
      <form>
        <label>
          <input name='check-input' type='checkbox' />
          Checkbox Option
        </label>

        <label>
          Text Option
          <input name='text-input' type='type' size='10' />
        </label>

        <label>
          Select Option
          <select name='selector'>
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
          </select>
        </label>
      </form>
    </div>
  )
}