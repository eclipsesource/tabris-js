import 'tabris';

export default async function() {
  const blob: Blob = new Blob();
  let file: File = new File([blob], 'foo');
  let str: string = '';
  const formData: FormData = new FormData();
  formData.append('foo', 'bar');
  formData.append('foo', blob);
  formData.append('foo', blob, 'bar');
  formData.append('foo', file);
  formData.append('foo', file, 'bar');
  formData.set('foo', 'bar');
  formData.set('foo', blob);
  formData.set('foo', blob, 'bar');
  formData.set('foo', file);
  formData.set('foo', file, 'bar');
  formData.delete('foo');
  file = formData.get('foo') as File;
  str = formData.get('foo') as string;
  const values: Array<string | File> = formData.getAll('foo');
  const bool: boolean = formData.has('foo');
  for (const entry of formData) {
    str = entry[0];
    str = entry[1] as string;
    file = entry[1] as File;
  }
  for (const entry of formData.entries()) {
    str = entry[0];
    str = entry[1] as string;
    file = entry[1] as File;
  }
  for (const value of formData.values()) {
    str = value as string;
    file = value as File;
  }
  for (const key of formData.keys()) {
    str = key;
  }
}
