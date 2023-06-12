export function validateTitle(title: string) {
  if (title.trim().length === 0) {
    return 'Title cannot be empty';
  }

  if (title.trim().length < 3) {
    return 'Title cannot be shorter than 3 characters';
  }

  if (title.trim().length > 50) {
    return 'Title cannot be longer than 50 characters';
  }
}

export function validateDescription(description: string) {
  if (description.trim().length === 0) {
    return 'Description cannot be empty';
  }

  if (description.trim().length < 3) {
    return 'Description cannot be shorter than 3 characters';
  }
}
