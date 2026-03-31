import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-3xl font-display tracking-wider text-primary">
            IRONLAB
          </Link>
          <nav>
            <Link href="/login">
              <Button variant="outline" className="font-semibold uppercase tracking-wide border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Já sou aluno
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col pt-16">
        <section className="relative flex-1 flex items-center justify-center min-h-[90vh] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background z-10" />
            <img 
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
              alt="Gym" 
              className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            />
          </div>
          
          <div className="container mx-auto px-4 z-10 text-center relative mt-[-10vh]">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-7xl md:text-9xl font-display mb-6 tracking-widest text-white drop-shadow-lg uppercase"
            >
              Forje seu <span className="text-primary">Legado</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium"
            >
              Sem atalhos. Sem desculpas. Apenas resultado. Junte-se à elite no centro de treinamento mais intenso da cidade.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button size="lg" className="h-16 px-10 text-xl font-display uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90">
                Começar Agora
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-display text-center mb-16 uppercase tracking-wider">A Diferença <span className="text-primary">IRONLAB</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Equipamento Elite", desc: "Maquinário de ponta selecionado para hipertrofia máxima e performance." },
                { title: "Comunidade Implacável", desc: "Treine ao lado de pessoas que levam o resultado a sério." },
                { title: "Acompanhamento Real", desc: "Treinadores que não ficam no celular. Focados no seu movimento." }
              ].map((b, i) => (
                <div key={i} className="bg-background p-8 rounded-xl border border-border flex flex-col items-center text-center group hover:border-primary transition-colors">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <div className="w-8 h-8 bg-primary rounded-sm rotate-45" />
                  </div>
                  <h3 className="text-2xl font-display mb-4 uppercase">{b.title}</h3>
                  <p className="text-muted-foreground">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-5xl font-display mb-6 uppercase tracking-wider">Escolha seu <span className="text-primary">Plano</span></h2>
            <p className="text-muted-foreground mb-16 max-w-xl mx-auto">Sem taxas ocultas. Sem fidelidade abusiva. Pague pelo que usa e treine duro.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="p-8 rounded-xl border border-border bg-card flex flex-col">
                <h3 className="text-3xl font-display uppercase mb-2">Mensal</h3>
                <div className="text-5xl font-display text-primary mb-6">R$ 189<span className="text-xl text-muted-foreground">/mês</span></div>
                <ul className="text-left space-y-4 mb-8 flex-1 text-muted-foreground">
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary rounded-full"/> Acesso livre todos os dias</li>
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary rounded-full"/> App com treinos</li>
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary rounded-full"/> Suporte dos professores</li>
                </ul>
                <Button variant="outline" className="w-full text-lg h-12 font-display uppercase tracking-wider">Assinar Mensal</Button>
              </div>

              <div className="p-8 rounded-xl border-2 border-primary bg-card flex flex-col relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(163,230,53,0.15)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Mais Vantajoso</div>
                <h3 className="text-3xl font-display uppercase mb-2">Semestral</h3>
                <div className="text-5xl font-display text-primary mb-6">R$ 149<span className="text-xl text-muted-foreground">/mês</span></div>
                <ul className="text-left space-y-4 mb-8 flex-1 text-foreground">
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary rounded-full"/> Tudo do plano Mensal</li>
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary rounded-full"/> 1 Avaliação Física Grátis</li>
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary rounded-full"/> Camiseta Exclusiva IRONLAB</li>
                </ul>
                <Button className="w-full text-lg h-12 font-display uppercase tracking-wider text-primary-foreground">Assinar Semestral</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-3xl font-display tracking-widest text-muted-foreground">IRONLAB</div>
          <div className="text-muted-foreground text-sm">© {new Date().getFullYear()} IRONLAB. Todos os direitos reservados.</div>
        </div>
      </footer>
    </div>
  );
}
