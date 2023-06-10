interface Props {
  errorMessage: string | null;
}

export default function FormFields({ errorMessage }: Props) {
  return (
    <fieldset>
      <div className='flex flex-col gap-4'>
        {errorMessage && <div className='text-red-500'>{errorMessage}</div>}
        <label htmlFor='title'>Title</label>
        <input
          className='rounded-lg border border-gray-300 p-4'
          type='text'
          name='title'
          id='title'
        />
      </div>
      <div className='flex flex-col gap-4'>
        <label htmlFor='description'>Description</label>
        <textarea
          className='rounded-lg border border-gray-300 p-4'
          name='description'
          id='description'
          cols={30}
          rows={10}
        ></textarea>
      </div>
    </fieldset>
  );
}
