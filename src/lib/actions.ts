'use server';

export async function addItem(data: FormData) {
	console.log('email', data.get('email'));
	return { success: true };
}
