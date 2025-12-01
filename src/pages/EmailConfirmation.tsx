import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const EmailConfirmation = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md shadow-elegant text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="font-serif text-3xl">Email Confirmed!</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Your email address has been successfully verified.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                        Thank you for confirming your email. You can now log in to your account and start shopping.
                    </p>
                    <Button
                        onClick={() => navigate("/auth")}
                        className="w-full transition-luxury"
                    >
                        Go to Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmailConfirmation;
