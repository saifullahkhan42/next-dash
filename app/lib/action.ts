'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

{/*
    import Zod and define a schema that matches the shape of your form object. 
    This schema will validate the formData before saving it to a database.
*/}

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer',
    }),
    amount: z.coerce
    .number()
    .gt(0, {message: "Please enter the amount greater than $0."}), //The amount field is specifically set to coerce (change) from a string to a number while also validating its type.
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an Invoice status',
    }),
    date: z.string(),
})

const CreateInvoice = FormSchema.omit({ id: true, date: true});

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];  
    };
    message?: string | null;
}

export async function createInvoice( prevState: State, formData: FormData) {
    // validate the form data
    const validatedFeilds = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    //If the form data is invalid, you can return an error message to the user:
    if(!validatedFeilds.success) {
        return {
            errors: validatedFeilds.error.flatten().fieldErrors,
            message: 'Missing feilds. Failed to create invoice',
        };
    }
    
    //You can then pass your rawFormData to CreateInvoice to validate the types:
    const {customerId, amount, status} = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    
    {/*
        Storing values in cents
        It's usually good practice to store monetary values in cents in your database to eliminate JavaScript floating-point errors and ensure greater accuracy.

        Let's convert the amount into cents:
    */}
    const amountInCents = amount * 100;

    //creating new date
    const date = new Date().toISOString().split('T')[0]; // Correct way to extract YYYY-MM-DD

    //inserting data into your database
    try {
        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch (error) {
        console.error('Failed to insert data:', error);        
    }       
    //revalidate the cache for the invoice page and redirect the user.
    revalidatePath('/dashboard/invoices'); //This will revalidate the /dashboard/invoices page after the form is submitted.
    redirect('/dashboard/invoices'); //This will redirect the user to the /dashboard/invoices page after the form is submitted.

}

// update invoice for specific invoice id
const UpdateInvoice = FormSchema.omit({ date: true, id: true });
export async function updateInvoice(id: string, formData: FormData){
    const {customerId, amount, status} = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;
    } catch (error) {
        console.error('Failed to update data:', error);
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}


// delete invoice for specific invoice id
export async function deleteInvoice(id: string){
    try {
        await sql`
            DELETE FROM invoices
            WHERE id = ${id}
        `;
    } catch (error) {
        console.error('Failed to delete data:', error);        
    }
    revalidatePath('/dashboard/invoices');
};

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
){
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials';
                default:
                    return 'Something went wrong';
            }
        }
        throw error;
    }
}