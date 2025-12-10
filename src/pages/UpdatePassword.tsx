import { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";

const updatePasswordSchema = z.object({
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

const UpdatePassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we have a session (the link should automatically log the user in lightly for the update)
        // or if we are just checking for recovery parameters in the URL
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // Optionally handle the case where the link is invalid or expired
                // For now, we'll let the Supabase client handle the internal state from the hash fragment
            }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event == "PASSWORD_RECOVERY") {
                // User is in the process of recovering their password
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        }
    }, []);

    const form = useForm<UpdatePasswordFormData>({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: UpdatePasswordFormData) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            });

            if (error) {
                throw error;
            }

            toast({
                title: "Password Updated",
                description: "Your password has been changed successfully. You can now log in.",
            });

            // Redirect to login or home
            navigate("/auth");
        } catch (error: any) {
            console.error("Update password error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to update password.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md shadow-elegant">
                <CardHeader>
                    <CardTitle className="font-serif text-3xl text-center">Set New Password</CardTitle>
                    <CardDescription className="text-center">
                        Type your new robust password below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••" {...field} />
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
                                {isLoading ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default UpdatePassword;
