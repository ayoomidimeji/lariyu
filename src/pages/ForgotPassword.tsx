import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const forgotPasswordSchema = z.object({
    email: z.string().trim().email({ message: "Invalid email address" }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { toast } = useToast();

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        try {
            // In a production environment, you would ensure the redirect URL points to your actual domain
            const redirectUrl = `${window.location.origin}/update-password`;

            const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
                redirectTo: redirectUrl,
            });

            if (error) {
                // For security, checking specific error messages (user not found) should be avoided 
                // to prevent enumeration, but since this is client-side, we'll log it and show a generic error 
                // if it's a network issue, or a success message regardless of user existence if desired.
                // However, Supabase often returns vague errors for security.
                throw error;
            }

            setIsSubmitted(true);
            toast({
                title: "Email sent",
                description: "Check your inbox for the password reset link.",
            });
        } catch (error: any) {
            console.error("Reset password error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md shadow-elegant">
                <CardHeader>
                    <CardTitle className="font-serif text-3xl text-center">Reset Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to receive a password reset link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSubmitted ? (
                        <div className="text-center space-y-6">
                            <div className="bg-green-50 text-green-700 p-4 rounded-lg">
                                <p className="font-medium">Check your email</p>
                                <p className="text-sm mt-1">If an account exists for {form.getValues("email")}, we have sent a password reset link.</p>
                            </div>
                            <Link to="/auth">
                                <Button variant="outline" className="w-full">Back to Login</Button>
                            </Link>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="your@email.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="w-full transition-luxury"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Sending link..." : "Send Reset Link"}
                                </Button>
                                <div className="text-center mt-4">
                                    <Link to="/auth" className="text-sm text-primary hover:underline">
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;
