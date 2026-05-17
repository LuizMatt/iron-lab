<template>
  <div class="min-h-screen bg-[#0d0d0d] flex">
    <!-- Sidebar -->
    <aside class="w-64 shrink-0 bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col min-h-screen">
      <div class="p-6 border-b border-[#1a1a1a]">
        <span class="font-display text-3xl text-[#a3e635] tracking-widest">IRONLAB</span>
        <p class="text-[#737373] text-xs mt-1 capitalize">{{ auth.user.value?.role }}</p>
      </div>

      <div class="p-4 border-b border-[#1a1a1a]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#a3e635]/20 flex items-center justify-center">
            <span class="text-[#a3e635] font-bold text-sm">{{ auth.user.value?.name?.charAt(0) }}</span>
          </div>
          <div class="min-w-0">
            <p class="text-[#f5f5f5] font-medium text-sm truncate">{{ auth.user.value?.name }}</p>
            <p class="text-[#737373] text-xs capitalize">{{ auth.user.value?.role }}</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <button
          v-for="item in navItems"
          :key="item.key"
          @click="activeTab = item.key"
          :class="[
            'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
            activeTab === item.key
              ? 'bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/20'
              : 'text-[#737373] hover:text-[#f5f5f5] hover:bg-[#141414]'
          ]"
        >
          <component :is="item.icon" class="w-4 h-4" />
          {{ item.label }}
        </button>
      </nav>

      <div class="p-4 border-t border-[#1a1a1a]">
        <button @click="auth.logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#737373] hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut class="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-auto">

      <!-- Alunos tab -->
      <div v-if="activeTab === 'alunos'">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="font-display text-4xl text-white">ALUNOS</h1>
            <p class="text-[#737373] text-sm mt-1">{{ students.length }} cadastrados</p>
          </div>
          <button @click="openStudentModal()" class="flex items-center gap-2 px-4 py-2 bg-[#a3e635] text-[#0d0d0d] rounded-lg text-sm font-bold hover:bg-[#bef264] transition-colors">
            <UserPlus class="w-4 h-4" />
            Novo Aluno
          </button>
        </div>
        <div class="mb-4">
          <input v-model="searchStudent" placeholder="Buscar por nome ou e-mail..." class="w-full max-w-sm bg-[#141414] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors" />
        </div>
        <div v-if="loadingStudents" class="text-center py-16 text-[#737373]">
          <Loader2 class="w-8 h-8 animate-spin mx-auto mb-4 text-[#a3e635]" />
        </div>
        <div v-else class="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-[#1a1a1a]">
              <tr>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Nome</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">E-mail</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Telefone</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#262626]">
              <tr v-if="filteredStudents.length === 0">
                <td colspan="4" class="text-center py-10 text-[#737373] text-sm">Nenhum aluno encontrado.</td>
              </tr>
              <tr v-for="student in filteredStudents" :key="student.id" class="hover:bg-[#1a1a1a] transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-[#a3e635]/10 flex items-center justify-center text-[#a3e635] text-xs font-bold">{{ student.name.charAt(0) }}</div>
                    <span class="text-sm text-[#f5f5f5]">{{ student.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-[#737373]">{{ student.email }}</td>
                <td class="px-6 py-4 text-sm text-[#737373]">{{ student.phone || "—" }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button @click="openStudentModal(student)" class="text-xs text-[#a3e635] hover:underline">Editar</button>
                    <span class="text-[#333]">|</span>
                    <button v-if="auth.user.value?.role === 'admin'" @click="deleteStudent(student.id)" class="text-xs text-red-400 hover:underline">Remover</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Treinos tab -->
      <div v-if="activeTab === 'treinos'">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="font-display text-4xl text-white">TREINOS</h1>
            <p class="text-[#737373] text-sm mt-1">{{ adminWorkouts.length }} treinos cadastrados</p>
          </div>
          <button @click="openWorkoutModal()" class="flex items-center gap-2 px-4 py-2 bg-[#a3e635] text-[#0d0d0d] rounded-lg text-sm font-bold hover:bg-[#bef264] transition-colors">
            <Plus class="w-4 h-4" />
            Novo Treino
          </button>
        </div>
        <div v-if="loadingAdminWorkouts" class="text-center py-16 text-[#737373]">
          <Loader2 class="w-8 h-8 animate-spin mx-auto mb-4 text-[#a3e635]" />
        </div>
        <div v-else class="space-y-4">
          <div v-for="workout in adminWorkouts" :key="workout.id" class="bg-[#141414] border border-[#262626] rounded-xl p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-white font-semibold">{{ workout.name }}</h3>
                <p v-if="workout.muscleGroups" class="text-[#737373] text-xs mt-1">{{ workout.muscleGroups }}</p>
              </div>
              <div class="flex gap-2">
                <button @click="openAssignModal(workout)" class="text-xs px-3 py-1.5 bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/20 rounded-lg hover:bg-[#a3e635]/20 transition-colors">Atribuir</button>
                <button @click="deleteAdminWorkout(workout.id)" class="text-xs px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors">Remover</button>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="ex in workout.exercises" :key="ex.id" class="text-xs bg-[#1a1a1a] border border-[#262626] rounded px-2 py-1 text-[#737373]">{{ ex.name }} {{ ex.sets }}x{{ ex.reps }}</span>
            </div>
          </div>
          <div v-if="adminWorkouts.length === 0" class="text-center py-16 text-[#737373]">Nenhum treino cadastrado.</div>
        </div>
      </div>

      <!-- Professores tab -->
      <div v-if="activeTab === 'professores'">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="font-display text-4xl text-white">PROFESSORES</h1>
            <p class="text-[#737373] text-sm mt-1">{{ professors.length }} cadastrados</p>
          </div>
          <button @click="openProfModal()" class="flex items-center gap-2 px-4 py-2 bg-[#a3e635] text-[#0d0d0d] rounded-lg text-sm font-bold hover:bg-[#bef264] transition-colors">
            <UserPlus class="w-4 h-4" />
            Novo Professor
          </button>
        </div>
        <div class="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-[#1a1a1a]">
              <tr>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Nome</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">E-mail</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#262626]">
              <tr v-if="professors.length === 0">
                <td colspan="3" class="text-center py-10 text-[#737373] text-sm">Nenhum professor cadastrado.</td>
              </tr>
              <tr v-for="prof in professors" :key="prof.id" class="hover:bg-[#1a1a1a] transition-colors">
                <td class="px-6 py-4 text-sm text-[#f5f5f5]">{{ prof.name }}</td>
                <td class="px-6 py-4 text-sm text-[#737373]">{{ prof.email }}</td>
                <td class="px-6 py-4">
                  <button @click="deleteProfessor(prof.id)" class="text-xs text-red-400 hover:underline">Remover</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Financeiro tab -->
      <div v-if="activeTab === 'financeiro'">
        <div class="flex items-center justify-between mb-8">
          <h1 class="font-display text-4xl text-white">FINANCEIRO</h1>
          <button @click="showPaymentModal = true" class="flex items-center gap-2 px-4 py-2 bg-[#a3e635] text-[#0d0d0d] rounded-lg text-sm font-bold hover:bg-[#bef264] transition-colors">
            <Plus class="w-4 h-4" />
            Gerar Cobrança Pix
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-[#141414] border border-[#262626] rounded-xl p-6">
            <p class="text-[#737373] text-xs uppercase tracking-wider mb-2">Total recebido</p>
            <p class="font-display text-4xl text-[#a3e635]">R$ {{ totalPaid.toFixed(2).replace(".", ",") }}</p>
          </div>
          <div class="bg-[#141414] border border-[#262626] rounded-xl p-6">
            <p class="text-[#737373] text-xs uppercase tracking-wider mb-2">Pendente</p>
            <p class="font-display text-4xl text-yellow-400">R$ {{ totalPending.toFixed(2).replace(".", ",") }}</p>
          </div>
          <div class="bg-[#141414] border border-[#262626] rounded-xl p-6">
            <p class="text-[#737373] text-xs uppercase tracking-wider mb-2">Total de cobranças</p>
            <p class="font-display text-4xl text-white">{{ allPayments.length }}</p>
          </div>
        </div>
        <div class="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
          <div class="p-6 border-b border-[#262626]">
            <h3 class="font-display text-2xl text-white">TODAS AS COBRANÇAS</h3>
          </div>
          <div v-if="loadingPayments" class="p-8 text-center">
            <Loader2 class="w-6 h-6 animate-spin mx-auto text-[#a3e635]" />
          </div>
          <table v-else class="w-full">
            <thead class="bg-[#1a1a1a]">
              <tr>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Aluno</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Valor</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Vencimento</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Status</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#262626]">
              <tr v-if="allPayments.length === 0">
                <td colspan="5" class="text-center py-10 text-[#737373] text-sm">Nenhuma cobrança encontrada.</td>
              </tr>
              <tr v-for="payment in allPayments" :key="payment.id" class="hover:bg-[#1a1a1a] transition-colors">
                <td class="px-6 py-4 text-sm text-[#f5f5f5]">{{ payment.userName || "—" }}</td>
                <td class="px-6 py-4 text-sm text-[#f5f5f5]">R$ {{ payment.amount.toFixed(2).replace(".", ",") }}</td>
                <td class="px-6 py-4 text-sm text-[#737373]">{{ payment.dueDate }}</td>
                <td class="px-6 py-4">
                  <span :class="['text-xs px-2 py-1 rounded-full font-medium', payment.status === 'paid' ? 'bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20']">
                    {{ payment.status === "paid" ? "Pago" : "Pendente" }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <button v-if="payment.status === 'pending'" @click="confirmPayment(payment.id)" class="text-xs text-[#a3e635] hover:underline">Confirmar</button>
                  <span v-else class="text-[#555] text-xs">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pacotes tab -->
      <div v-if="activeTab === 'pacotes'">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="font-display text-4xl text-white">PACOTES</h1>
            <p class="text-[#737373] text-sm mt-1">{{ packages.length }} pacotes cadastrados</p>
          </div>
          <button @click="openPackageModal()" class="flex items-center gap-2 px-4 py-2 bg-[#a3e635] text-[#0d0d0d] rounded-lg text-sm font-bold hover:bg-[#bef264] transition-colors">
            <Plus class="w-4 h-4" />
            Novo Pacote
          </button>
        </div>
        <div v-if="loadingPackages" class="text-center py-16 text-[#737373]">
          <Loader2 class="w-8 h-8 animate-spin mx-auto mb-4 text-[#a3e635]" />
        </div>
        <div v-else-if="packagesError" class="text-center py-16 text-red-400 text-sm">{{ packagesError }}</div>
        <div v-else class="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-[#1a1a1a]">
              <tr>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Nome</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Subtítulo</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Preço</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Destaque</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Ativo</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Ordem</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#262626]">
              <tr v-if="packages.length === 0">
                <td colspan="7" class="text-center py-10 text-[#737373] text-sm">Nenhum pacote cadastrado.</td>
              </tr>
              <tr v-for="pkg in packages" :key="pkg.id" class="hover:bg-[#1a1a1a] transition-colors">
                <td class="px-6 py-4 text-sm text-[#f5f5f5] font-medium">{{ pkg.name }}</td>
                <td class="px-6 py-4 text-sm text-[#737373] max-w-[180px] truncate">{{ pkg.subtitle || "—" }}</td>
                <td class="px-6 py-4 text-sm text-[#f5f5f5]">R$ {{ Number(pkg.price).toFixed(2).replace(".", ",") }}</td>
                <td class="px-6 py-4">
                  <button @click="togglePackageField(pkg, 'is_featured')" :class="['text-xs px-2 py-1 rounded-full font-medium border transition-colors', pkg.is_featured ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20' : 'bg-[#1a1a1a] text-[#555] border-[#333] hover:border-[#555]']">
                    {{ pkg.is_featured ? "Destaque" : "Normal" }}
                  </button>
                </td>
                <td class="px-6 py-4">
                  <button @click="togglePackageField(pkg, 'is_active')" :class="['text-xs px-2 py-1 rounded-full font-medium border transition-colors', pkg.is_active ? 'bg-[#a3e635]/10 text-[#a3e635] border-[#a3e635]/20 hover:bg-[#a3e635]/20' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20']">
                    {{ pkg.is_active ? "Ativo" : "Inativo" }}
                  </button>
                </td>
                <td class="px-6 py-4 text-sm text-[#737373]">{{ pkg.display_order }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button @click="openPackageModal(pkg)" class="text-xs text-[#a3e635] hover:underline">Editar</button>
                    <span class="text-[#333]">|</span>
                    <button @click="deletePackage(pkg.id)" class="text-xs text-red-400 hover:underline">Remover</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Slides tab -->
      <div v-if="activeTab === 'slides'">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="font-display text-4xl text-white">SLIDES</h1>
            <p class="text-[#737373] text-sm mt-1">{{ sliderImages.length }} slides cadastrados</p>
          </div>
          <button @click="openSlideModal()" class="flex items-center gap-2 px-4 py-2 bg-[#a3e635] text-[#0d0d0d] rounded-lg text-sm font-bold hover:bg-[#bef264] transition-colors">
            <Plus class="w-4 h-4" />
            Novo Slide
          </button>
        </div>
        <div v-if="loadingSlides" class="text-center py-16 text-[#737373]">
          <Loader2 class="w-8 h-8 animate-spin mx-auto mb-4 text-[#a3e635]" />
        </div>
        <div v-else-if="slidesError" class="text-center py-16 text-red-400 text-sm">{{ slidesError }}</div>
        <div v-else class="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-[#1a1a1a]">
              <tr>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Preview</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Alt Text</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Mobile</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Ordem</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Ativo</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#262626]">
              <tr v-if="sliderImages.length === 0">
                <td colspan="6" class="text-center py-10 text-[#737373] text-sm">Nenhum slide cadastrado.</td>
              </tr>
              <tr v-for="slide in sliderImages" :key="slide.id" class="hover:bg-[#1a1a1a] transition-colors">
                <td class="px-6 py-4">
                  <div class="w-20 h-12 rounded-lg overflow-hidden bg-[#262626] flex items-center justify-center border border-[#333]">
                    <img v-if="slide.image_url" :src="slide.image_url" :alt="slide.alt_text || 'slide'" class="w-full h-full object-cover" @error="(e: Event) => (e.target as HTMLImageElement).style.display = 'none'" />
                    <ImageIcon v-else class="w-5 h-5 text-[#555]" />
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-[#737373] max-w-[200px] truncate">{{ slide.alt_text || "—" }}</td>
                <td class="px-6 py-4">
                  <span :class="['text-xs px-2 py-1 rounded-full font-medium border', slide.mobile_image_url ? 'bg-[#a3e635]/10 text-[#a3e635] border-[#a3e635]/20' : 'bg-[#1a1a1a] text-[#555] border-[#333]']">
                    {{ slide.mobile_image_url ? "Sim" : "Não" }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-[#737373]">{{ slide.display_order }}</td>
                <td class="px-6 py-4">
                  <button @click="toggleSlideActive(slide)" :class="['text-xs px-2 py-1 rounded-full font-medium border transition-colors', slide.is_active ? 'bg-[#a3e635]/10 text-[#a3e635] border-[#a3e635]/20 hover:bg-[#a3e635]/20' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20']">
                    {{ slide.is_active ? "Ativo" : "Inativo" }}
                  </button>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button @click="openSlideModal(slide)" class="text-xs text-[#a3e635] hover:underline">Editar</button>
                    <span class="text-[#333]">|</span>
                    <button @click="deleteSlide(slide.id)" class="text-xs text-red-400 hover:underline">Remover</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>

    <!-- Student Modal -->
    <Teleport to="body">
      <div v-if="showStudentModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" @click.self="showStudentModal = false">
        <div class="bg-[#141414] border border-[#262626] rounded-xl p-8 max-w-md w-full">
          <h3 class="font-display text-2xl text-white mb-6">{{ editingStudent ? "EDITAR ALUNO" : "NOVO ALUNO" }}</h3>
          <form @submit.prevent="saveStudent" class="space-y-4">
            <div>
              <label class="block text-sm text-[#f5f5f5] mb-2">Nome</label>
              <input v-model="studentForm.name" required class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors" />
            </div>
            <div>
              <label class="block text-sm text-[#f5f5f5] mb-2">E-mail</label>
              <input v-model="studentForm.email" type="email" required class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors" />
            </div>
            <div v-if="!editingStudent">
              <label class="block text-sm text-[#f5f5f5] mb-2">Senha</label>
              <input v-model="studentForm.password" type="password" required class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors" />
            </div>
            <div>
              <label class="block text-sm text-[#f5f5f5] mb-2">Telefone</label>
              <input v-model="studentForm.phone" type="tel" class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors" />
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" @click="showStudentModal = false" class="flex-1 border border-[#262626] text-[#f5f5f5] py-3 rounded-lg text-sm hover:border-[#333] transition-colors">Cancelar</button>
              <button type="submit" :disabled="savingStudent" class="flex-1 bg-[#a3e635] text-[#0d0d0d] py-3 rounded-lg text-sm font-bold hover:bg-[#bef264] transition-colors disabled:opacity-60">{{ savingStudent ? "Salvando..." : "Salvar" }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Workout Modal -->
    <Teleport to="body">
      <div v-if="showWorkoutModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" @click.self="showWorkoutModal = false">
        <div class="bg-[#141414] border border-[#262626] rounded-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <h3 class="font-display text-2xl text-white mb-6">NOVO TREINO</h3>
          <form @submit.prevent="saveWorkout" class="space-y-4">
            <div>
              <label class="block text-sm text-[#f5f5f5] mb-2">Nome</label>
              <input v-model="workoutForm.name" required class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors" />
            </div>
            <div>
              <label class="block text-sm text-[#f5f5f5] mb-2">Grupos musculares</label>
              <input v-model="workoutForm.muscleGroups" placeholder="Ex: Peito, Tríceps" class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors" />
            </div>
            <div>
              <div class="flex items-center justify-between mb-3">
                <label class="text-sm text-[#f5f5f5]">Exercícios</label>
                <button type="button" @click="workoutForm.exercises.push({ name: '', sets: 3, reps: '12' })" class="text-xs text-[#a3e635] hover:underline">+ Adicionar</button>
              </div>
              <div class="space-y-3">
                <div v-for="(ex, i) in workoutForm.exercises" :key="i" class="grid grid-cols-3 gap-2 bg-[#1a1a1a] p-3 rounded-lg">
                  <input v-model="ex.name" placeholder="Exercício" required class="col-span-3 bg-[#262626] border border-[#333] rounded px-3 py-2 text-[#f5f5f5] text-xs outline-none focus:border-[#a3e635]" />
                  <input v-model.number="ex.sets" placeholder="Séries" type="number" min="1" required class="bg-[#262626] border border-[#333] rounded px-3 py-2 text-[#f5f5f5] text-xs outline-none focus:border-[#a3e635]" />
                  <input v-model="ex.reps" placeholder="Reps" required class="bg-[#262626] border border-[#333] rounded px-3 py-2 text-[#f5f5f5] text-xs outline-none focus:border-[#a3e635]" />
                  <button v-if="workoutForm.exercises.length > 1" type="button" @click="workoutForm.exercises.splice(i, 1)" class="text-red-400 text-xs hover:underline">Remover</button>
                </div>
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" @click="showWorkoutModal = false" class="flex-1 border border-[#262626] text-[#f5f5f5] py-3 rounded-lg text-sm">Cancelar</button>
              <button type="submit" :disabled="savingWorkout" class="flex-1 bg-[#a3e635] text-[#0d0d0d] py-3 rounded-lg text-sm font-bold hover:bg-[#bef264] transition-colors disabled:opacity-60">{{ savingWorkout ? "Salvando..." : "Criar Treino" }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Assign Modal -->
    <Teleport to="body">
      <div v-if="showAssignModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" @click.self="showAssignModal = false">
        <div class="bg-[#141414] border border-[#262626] rounded-xl p-8 max-w-md w-full">
          <h3 class="font-display text-2xl text-white mb-2">ATRIBUIR TREINO</h3>
          <p class="text-[#737373] text-sm mb-6">{{ assigningWorkout?.name }}</p>
          <div class="space-y-2 max-h-64 overflow-y-auto mb-6">
            <label v-for="student in students" :key="student.id" class="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg cursor-pointer hover:bg-[#262626] transition-colors">
              <input type="checkbox" :value="student.id" v-model="selectedStudentIds" class="accent-[#a3e635]" />
              <span class="text-sm text-[#f5f5f5]">{{ student.name }}</span>
              <span class="text-xs text-[#737373] ml-auto">{{ student.email }}</span>
            </label>
          </div>
          <div class="flex gap-3">
            <button @click="showAssignModal = false" class="flex-1 border border-[#262626] text-[#f5f5f5] py-3 rounded-lg text-sm">Cancelar</button>
            <button @click="assignWorkout" :disabled="selectedStudentIds.length === 0 || assigning" class="flex-1 bg-[#a3e635] text-[#0d0d0d] py-3 rounded-lg text-sm font-bold hover:bg-[#bef264] transition-colors disabled:opacity-60">
              {{ assigning ? "Atribuindo..." : `Atribuir (${selectedStudentIds.length})` }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Payment Modal -->
    <Teleport to="body">
      <div v-if="showPaymentModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" @click.self="showPaymentModal = false">
        <div class="bg-[#141414] border border-[#262626] rounded-xl p-8 max-w-md w-full">
          <h3 class="font-display text-2xl text-white mb-6">GERAR COBRANÇA PIX</h3>
          <form @submit.prevent="generatePayment" class="space-y-4">
            <div>
              <label class="block text-sm text-[#f5f5f5] mb-2">Aluno</label>
              <select v-model="paymentForm.userId" required class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors">
                <option value="">Selecione um aluno</option>
                <option v-for="s in students" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-[#f5f5f5] mb-2">Valor (R$)</label>
              <input v-model.number="paymentForm.amount" type="number" min="1" step="0.01" required placeholder="99.90" class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors" />
            </div>
            <div>
              <label class="block text-sm text-[#f5f5f5] mb-2">Data de vencimento</label>
              <input v-model="paymentForm.dueDate" type="date" required class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors" />
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" @click="showPaymentModal = false" class="flex-1 border border-[#262626] text-[#f5f5f5] py-3 rounded-lg text-sm">Cancelar</button>
              <button type="submit" :disabled="savingPayment" class="flex-1 bg-[#a3e635] text-[#0d0d0d] py-3 rounded-lg text-sm font-bold hover:bg-[#bef264] transition-colors disabled:opacity-60">{{ savingPayment ? "Gerando..." : "Gerar Cobrança" }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Package Modal -->
    <Teleport to="body">
      <div v-if="showPackageModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" @click.self="showPackageModal = false">
        <div class="bg-[#141414] border border-[#262626] rounded-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <h3 class="font-display text-2xl text-white mb-6">{{ editingPackage ? "EDITAR PACOTE" : "NOVO PACOTE" }}</h3>
          <form @submit.prevent="savePackage" class="space-y-4">
            <div>
              <label class="block text-sm text-[#f5f5f5] mb-2">Nome</label>
              <input v-model="packageForm.name" required placeholder="Ex: Plano Premium" class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors" />
            </div>
            <div>
              <label class="block text-sm text-[#f5f5f5] mb-2">Subtítulo</label>
              <input v-model="packageForm.subtitle" placeholder="Ex: Acesso completo à academia" class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors" />
            </div>
            <div>
              <label class="block text-sm text-[#f5f5f5] mb-2">Preço (R$)</label>
              <input v-model.number="packageForm.price" type="number" min="0" step="0.01" required placeholder="99.90" class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-[#f5f5f5] mb-2">Ordem de exibição</label>
                <input v-model.number="packageForm.display_order" type="number" min="0" class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors" />
              </div>
              <div class="flex flex-col gap-3 pt-6">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="packageForm.is_featured" class="accent-[#a3e635] w-4 h-4" />
                  <span class="text-sm text-[#f5f5f5]">Destaque</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="packageForm.is_active" class="accent-[#a3e635] w-4 h-4" />
                  <span class="text-sm text-[#f5f5f5]">Ativo</span>
                </label>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between mb-3">
                <label class="text-sm text-[#f5f5f5]">Funcionalidades</label>
                <button type="button" @click="packageForm.features.push('')" class="text-xs text-[#a3e635] hover:underline">+ Adicionar item</button>
              </div>
              <div class="space-y-2">
                <div v-if="packageForm.features.length === 0" class="text-xs text-[#555] text-center py-3 border border-dashed border-[#333] rounded-lg">Nenhuma funcionalidade adicionada</div>
                <div v-for="(feat, i) in packageForm.features" :key="i" class="flex items-center gap-2">
                  <input v-model="packageForm.features[i]" :placeholder="`Funcionalidade ${i + 1}`" class="flex-1 bg-[#1a1a1a] border border-[#262626] rounded-lg px-3 py-2 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors" />
                  <button type="button" @click="packageForm.features.splice(i, 1)" class="text-red-400 hover:text-red-300 transition-colors p-1"><X class="w-4 h-4" /></button>
                </div>
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" @click="showPackageModal = false" class="flex-1 border border-[#262626] text-[#f5f5f5] py-3 rounded-lg text-sm hover:border-[#333] transition-colors">Cancelar</button>
              <button type="submit" :disabled="savingPackage" class="flex-1 bg-[#a3e635] text-[#0d0d0d] py-3 rounded-lg text-sm font-bold hover:bg-[#bef264] transition-colors disabled:opacity-60">{{ savingPackage ? "Salvando..." : "Salvar" }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ==================== SLIDE MODAL (file upload) ==================== -->
    <Teleport to="body">
      <div v-if="showSlideModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" @click.self="showSlideModal = false">
        <div class="bg-[#141414] border border-[#262626] rounded-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <h3 class="font-display text-2xl text-white mb-6">{{ editingSlide ? "EDITAR SLIDE" : "NOVO SLIDE" }}</h3>
          <form @submit.prevent="saveSlide" class="space-y-4">

            <!-- Imagem desktop -->
            <div>
              <label class="block text-sm text-[#f5f5f5] mb-2">
                Imagem desktop
                <span v-if="editingSlide" class="text-[#555]">— deixe em branco para manter a atual</span>
              </label>
              <input
                ref="desktopFileInput"
                type="file"
                accept="image/*"
                @change="onDesktopFileChange"
                :required="!editingSlide"
                class="w-full text-sm text-[#737373] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#a3e635] file:text-[#0d0d0d] hover:file:bg-[#bef264] file:cursor-pointer bg-[#1a1a1a] border border-[#262626] rounded-lg px-3 py-2 outline-none focus:border-[#a3e635] transition-colors"
              />
              <div v-if="slideForm.desktopPreview" class="mt-2 w-full h-32 rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#262626]">
                <img :src="slideForm.desktopPreview" alt="preview desktop" class="w-full h-full object-cover" />
              </div>
              <div v-else-if="editingSlide?.image_url" class="mt-2">
                <p class="text-xs text-[#555] mb-1">Imagem atual:</p>
                <div class="w-full h-32 rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#262626]">
                  <img :src="editingSlide.image_url" alt="imagem atual" class="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <!-- Imagem mobile -->
            <div>
              <label class="block text-sm text-[#f5f5f5] mb-2">
                Imagem mobile <span class="text-[#555]">opcional</span>
              </label>
              <input
                ref="mobileFileInput"
                type="file"
                accept="image/*"
                @change="onMobileFileChange"
                class="w-full text-sm text-[#737373] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#a3e635] file:text-[#0d0d0d] hover:file:bg-[#bef264] file:cursor-pointer bg-[#1a1a1a] border border-[#262626] rounded-lg px-3 py-2 outline-none focus:border-[#a3e635] transition-colors"
              />
              <div v-if="slideForm.mobilePreview" class="mt-2 w-24 h-32 rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#262626]">
                <img :src="slideForm.mobilePreview" alt="preview mobile" class="w-full h-full object-cover" />
              </div>
              <div v-else-if="editingSlide?.mobile_image_url" class="mt-2">
                <p class="text-xs text-[#555] mb-1">Imagem mobile atual:</p>
                <div class="w-24 h-32 rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#262626]">
                  <img :src="editingSlide.mobile_image_url" alt="mobile atual" class="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm text-[#f5f5f5] mb-2">Texto alternativo (alt)</label>
              <input v-model="slideForm.alt_text" placeholder="Descrição da imagem para acessibilidade" class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-[#f5f5f5] mb-2">Ordem de exibição</label>
                <input v-model.number="slideForm.display_order" type="number" min="0" class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors" />
              </div>
              <div class="flex items-end pb-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="slideForm.is_active" class="accent-[#a3e635] w-4 h-4" />
                  <span class="text-sm text-[#f5f5f5]">Ativo</span>
                </label>
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" @click="showSlideModal = false" class="flex-1 border border-[#262626] text-[#f5f5f5] py-3 rounded-lg text-sm hover:border-[#333] transition-colors">Cancelar</button>
              <button type="submit" :disabled="savingSlide" class="flex-1 bg-[#a3e635] text-[#0d0d0d] py-3 rounded-lg text-sm font-bold hover:bg-[#bef264] transition-colors disabled:opacity-60">{{ savingSlide ? "Salvando..." : "Salvar" }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Dumbbell, CreditCard, Users, UserPlus, LogOut, Plus, Loader2, Package, Image as ImageIcon, X } from "lucide-vue-next";

definePageMeta({ middleware: "auth" });

const auth = useAuth();
const api = useApi();

const isAdmin = computed(() => auth.user.value?.role === "admin");

const navItems = computed(() => {
  const items = [
    { key: "alunos", label: "Alunos", icon: Users },
    { key: "treinos", label: "Treinos", icon: Dumbbell },
    { key: "financeiro", label: "Financeiro", icon: CreditCard },
    { key: "pacotes", label: "Pacotes", icon: Package },
    { key: "slides", label: "Slides", icon: ImageIcon },
  ];
  if (isAdmin.value) {
    items.splice(2, 0, { key: "professores", label: "Professores", icon: Users });
  }
  return items;
});

const activeTab = ref("alunos");

// --- Alunos ---
const students = ref<User[]>([]);
const professors = ref<User[]>([]);
const loadingStudents = ref(true);
const searchStudent = ref("");
const showStudentModal = ref(false);
const editingStudent = ref<User | null>(null);
const savingStudent = ref(false);
const studentForm = reactive({ name: "", email: "", password: "", phone: "" });

const filteredStudents = computed(() =>
  students.value.filter(
    (s) =>
      s.name.toLowerCase().includes(searchStudent.value.toLowerCase()) ||
      s.email.toLowerCase().includes(searchStudent.value.toLowerCase()),
  ),
);

const fetchStudents = async () => {
  loadingStudents.value = true;
  try { students.value = await api.get<User[]>("/users?role=aluno"); } catch {}
  loadingStudents.value = false;
};

const fetchProfessors = async () => {
  try { professors.value = await api.get<User[]>("/users?role=professor"); } catch {}
};

const openStudentModal = (student?: User) => {
  editingStudent.value = student || null;
  if (student) {
    studentForm.name = student.name;
    studentForm.email = student.email;
    studentForm.phone = student.phone ?? "";
    studentForm.password = "";
  } else {
    Object.assign(studentForm, { name: "", email: "", password: "", phone: "" });
  }
  showStudentModal.value = true;
};

const saveStudent = async () => {
  savingStudent.value = true;
  try {
    if (editingStudent.value) {
      const updated = await api.put<User>(`/users/${editingStudent.value.id}`, { name: studentForm.name, email: studentForm.email, phone: studentForm.phone || undefined });
      const idx = students.value.findIndex((s) => s.id === updated.id);
      if (idx !== -1) students.value[idx] = updated;
    } else {
      const created = await api.post<User>("/users", { name: studentForm.name, email: studentForm.email, password: studentForm.password, role: "aluno", phone: studentForm.phone || undefined });
      students.value.unshift(created);
    }
    showStudentModal.value = false;
  } catch {}
  savingStudent.value = false;
};

const deleteStudent = async (id: string) => {
  if (!confirm("Remover este aluno?")) return;
  try { await api.del(`/users/${id}`); students.value = students.value.filter((s) => s.id !== id); } catch {}
};

const openProfModal = () => {
  Object.assign(studentForm, { name: "", email: "", password: "", phone: "" });
  editingStudent.value = null;
  showStudentModal.value = true;
};

const deleteProfessor = async (id: string) => {
  if (!confirm("Remover este professor?")) return;
  try { await api.del(`/users/${id}`); professors.value = professors.value.filter((p) => p.id !== id); } catch {}
};

// --- Treinos ---
const adminWorkouts = ref<Workout[]>([]);
const loadingAdminWorkouts = ref(true);
const showWorkoutModal = ref(false);
const savingWorkout = ref(false);
const workoutForm = reactive({ name: "", muscleGroups: "", exercises: [{ name: "", sets: 3, reps: "12" }] });
const showAssignModal = ref(false);
const assigningWorkout = ref<Workout | null>(null);
const selectedStudentIds = ref<string[]>([]);
const assigning = ref(false);

const fetchAdminWorkouts = async () => {
  loadingAdminWorkouts.value = true;
  try { adminWorkouts.value = await api.get<Workout[]>("/workouts"); } catch {}
  loadingAdminWorkouts.value = false;
};

const openWorkoutModal = () => {
  Object.assign(workoutForm, { name: "", muscleGroups: "", exercises: [{ name: "", sets: 3, reps: "12" }] });
  showWorkoutModal.value = true;
};

const saveWorkout = async () => {
  savingWorkout.value = true;
  try {
    const created = await api.post<Workout>("/workouts", { name: workoutForm.name, muscleGroups: workoutForm.muscleGroups || undefined, isCustom: false, exercises: workoutForm.exercises });
    adminWorkouts.value.unshift(created);
    showWorkoutModal.value = false;
  } catch {}
  savingWorkout.value = false;
};

const deleteAdminWorkout = async (id: string) => {
  if (!confirm("Remover este treino?")) return;
  try { await api.del(`/workouts/${id}`); adminWorkouts.value = adminWorkouts.value.filter((w) => w.id !== id); } catch {}
};

const openAssignModal = (workout: Workout) => {
  assigningWorkout.value = workout;
  selectedStudentIds.value = [];
  showAssignModal.value = true;
};

const assignWorkout = async () => {
  if (!assigningWorkout.value) return;
  assigning.value = true;
  try { await api.post(`/workouts/${assigningWorkout.value.id}/assign`, { userIds: selectedStudentIds.value }); showAssignModal.value = false; } catch {}
  assigning.value = false;
};

// --- Financeiro ---
const allPayments = ref<Payment[]>([]);
const loadingPayments = ref(false);
const showPaymentModal = ref(false);
const savingPayment = ref(false);
const paymentForm = reactive({ userId: "", amount: 0, dueDate: "" });

const totalPaid = computed(() => allPayments.value.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0));
const totalPending = computed(() => allPayments.value.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0));

const fetchAllPayments = async () => {
  loadingPayments.value = true;
  try { allPayments.value = await api.get<Payment[]>("/payments"); } catch {}
  loadingPayments.value = false;
};

const generatePayment = async () => {
  savingPayment.value = true;
  try {
    const payment = await api.post<Payment>("/payments/generate", { userId: paymentForm.userId, amount: paymentForm.amount, dueDate: paymentForm.dueDate });
    allPayments.value.unshift(payment);
    showPaymentModal.value = false;
    Object.assign(paymentForm, { userId: "", amount: 0, dueDate: "" });
  } catch {}
  savingPayment.value = false;
};

const confirmPayment = async (id: string) => {
  try {
    const updated = await api.post<Payment>("/payments/webhook", { paymentId: id });
    const idx = allPayments.value.findIndex((p) => p.id === id);
    if (idx !== -1) allPayments.value[idx] = updated;
  } catch {}
};

// --- Pacotes ---
interface PackageItem {
  id: string;
  name: string;
  subtitle?: string | null;
  price: number;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  features: string[];
}

const packages = ref<PackageItem[]>([]);
const loadingPackages = ref(false);
const packagesError = ref("");
const showPackageModal = ref(false);
const editingPackage = ref<PackageItem | null>(null);
const savingPackage = ref(false);
const packageForm = reactive({ name: "", subtitle: "", price: 0, is_featured: false, is_active: true, display_order: 0, features: [] as string[] });

const fetchPackages = async () => {
  loadingPackages.value = true;
  packagesError.value = "";
  try { packages.value = await api.get<PackageItem[]>("/packages/all"); } catch (e: any) { packagesError.value = e?.message || "Erro ao carregar pacotes."; }
  loadingPackages.value = false;
};

const openPackageModal = (pkg?: PackageItem) => {
  editingPackage.value = pkg || null;
  if (pkg) {
    packageForm.name = pkg.name;
    packageForm.subtitle = pkg.subtitle ?? "";
    packageForm.price = pkg.price;
    packageForm.is_featured = pkg.is_featured;
    packageForm.is_active = pkg.is_active;
    packageForm.display_order = pkg.display_order;
    packageForm.features = [...(pkg.features ?? [])];
  } else {
    Object.assign(packageForm, { name: "", subtitle: "", price: 0, is_featured: false, is_active: true, display_order: 0, features: [] });
  }
  showPackageModal.value = true;
};

const savePackage = async () => {
  savingPackage.value = true;
  try {
    const payload = { name: packageForm.name, subtitle: packageForm.subtitle || undefined, price: packageForm.price, is_featured: packageForm.is_featured, is_active: packageForm.is_active, display_order: packageForm.display_order, features: packageForm.features.filter((f) => f.trim() !== "") };
    if (editingPackage.value) {
      const updated = await api.put<PackageItem>(`/packages/${editingPackage.value.id}`, payload);
      const idx = packages.value.findIndex((p) => p.id === updated.id);
      if (idx !== -1) packages.value[idx] = updated;
    } else {
      const created = await api.post<PackageItem>("/packages", payload);
      packages.value.push(created);
    }
    showPackageModal.value = false;
  } catch {}
  savingPackage.value = false;
};

const deletePackage = async (id: string) => {
  if (!confirm("Remover este pacote?")) return;
  try { await api.del(`/packages/${id}`); packages.value = packages.value.filter((p) => p.id !== id); } catch {}
};

const togglePackageField = async (pkg: PackageItem, field: "is_active" | "is_featured") => {
  const original = pkg[field];
  pkg[field] = !original;
  try { await api.put(`/packages/${pkg.id}`, { [field]: pkg[field] }); } catch { pkg[field] = original; }
};

// --- Slides ---
interface SliderImage {
  id: string;
  image_url: string;
  mobile_image_url?: string | null;
  alt_text?: string | null;
  display_order: number;
  is_active: boolean;
}

const sliderImages = ref<SliderImage[]>([]);
const loadingSlides = ref(false);
const slidesError = ref("");
const showSlideModal = ref(false);
const editingSlide = ref<SliderImage | null>(null);
const savingSlide = ref(false);

const desktopFileInput = ref<HTMLInputElement | null>(null);
const mobileFileInput = ref<HTMLInputElement | null>(null);

const slideForm = reactive({
  desktopFile: null as File | null,
  mobileFile: null as File | null,
  desktopPreview: "",
  mobilePreview: "",
  alt_text: "",
  display_order: 0,
  is_active: true,
});

const onDesktopFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (slideForm.desktopPreview) URL.revokeObjectURL(slideForm.desktopPreview);
  slideForm.desktopFile = file;
  slideForm.desktopPreview = URL.createObjectURL(file);
};

const onMobileFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (slideForm.mobilePreview) URL.revokeObjectURL(slideForm.mobilePreview);
  slideForm.mobileFile = file;
  slideForm.mobilePreview = URL.createObjectURL(file);
};

const fetchSlides = async () => {
  loadingSlides.value = true;
  slidesError.value = "";
  try { sliderImages.value = await api.get<SliderImage[]>("/slider-images/all"); } catch (e: any) { slidesError.value = e?.message || "Erro ao carregar slides."; }
  loadingSlides.value = false;
};

const openSlideModal = (slide?: SliderImage) => {
  editingSlide.value = slide || null;
  if (slideForm.desktopPreview) URL.revokeObjectURL(slideForm.desktopPreview);
  if (slideForm.mobilePreview) URL.revokeObjectURL(slideForm.mobilePreview);
  Object.assign(slideForm, {
    desktopFile: null,
    mobileFile: null,
    desktopPreview: "",
    mobilePreview: "",
    alt_text: slide?.alt_text ?? "",
    display_order: slide?.display_order ?? 0,
    is_active: slide?.is_active ?? true,
  });
  nextTick(() => {
    if (desktopFileInput.value) desktopFileInput.value.value = "";
    if (mobileFileInput.value) mobileFileInput.value.value = "";
  });
  showSlideModal.value = true;
};

const saveSlide = async () => {
  savingSlide.value = true;
  try {
    const formData = new FormData();
    if (slideForm.desktopFile) formData.append("image", slideForm.desktopFile);
    if (slideForm.mobileFile) formData.append("mobile_image", slideForm.mobileFile);
    if (slideForm.alt_text) formData.append("alt_text", slideForm.alt_text);
    formData.append("display_order", String(slideForm.display_order));
    formData.append("is_active", String(slideForm.is_active));

    if (editingSlide.value) {
      const updated = await $fetch<SliderImage>(`/api/slider-images/${editingSlide.value.id}`, { method: "PUT", body: formData });
      const idx = sliderImages.value.findIndex((s) => s.id === updated.id);
      if (idx !== -1) sliderImages.value[idx] = updated;
    } else {
      const created = await $fetch<SliderImage>("/api/slider-images", { method: "POST", body: formData });
      sliderImages.value.push(created);
    }
    showSlideModal.value = false;
  } catch {}
  savingSlide.value = false;
};

const deleteSlide = async (id: string) => {
  if (!confirm("Remover este slide?")) return;
  try { await api.del(`/slider-images/${id}`); sliderImages.value = sliderImages.value.filter((s) => s.id !== id); } catch {}
};

const toggleSlideActive = async (slide: SliderImage) => {
  const original = slide.is_active;
  slide.is_active = !original;
  try { await api.put(`/slider-images/${slide.id}`, { is_active: slide.is_active }); } catch { slide.is_active = original; }
};

// --- Watch tabs ---
watch(activeTab, async (tab) => {
  if (tab === "alunos" && students.value.length === 0) await fetchStudents();
  if (tab === "treinos" && adminWorkouts.value.length === 0) await Promise.all([fetchAdminWorkouts(), fetchStudents()]);
  if (tab === "professores" && professors.value.length === 0) await fetchProfessors();
  if (tab === "financeiro" && allPayments.value.length === 0) await Promise.all([fetchAllPayments(), fetchStudents()]);
  if (tab === "pacotes" && packages.value.length === 0) await fetchPackages();
  if (tab === "slides" && sliderImages.value.length === 0) await fetchSlides();
});

onMounted(async () => {
  await fetchStudents();
});
</script>
