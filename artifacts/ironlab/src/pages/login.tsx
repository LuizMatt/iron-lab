import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useLogin } from "@workspace/api-client-react";
import { setToken, decodeJWT } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(1, { message: "Senha obrigatória" }),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate({ data: values }, {
      onSuccess: (res) => {
        setToken(res.token);
        const decoded = decodeJWT(res.token);
        if (decoded?.role === "admin" || decoded?.role === "professor") {
          setLocation("/admin");
        } else {
          setLocation("/dashboard");
        }
      },
      onError: () => {
        toast({
          title: "Erro ao entrar",
          description: "Verifique suas credenciais e tente novamente.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-xl p-8 relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-4xl font-display text-primary tracking-widest mb-2">
            IRONLAB
          </Link>
          <p className="text-muted-foreground uppercase text-sm tracking-wider font-semibold">Acesso ao Sistema</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs tracking-wider text-muted-foreground font-bold">E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="seu@email.com" {...field} className="bg-background h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs tracking-wider text-muted-foreground font-bold">Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-background h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full h-12 font-display text-xl uppercase tracking-widest text-primary-foreground"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
