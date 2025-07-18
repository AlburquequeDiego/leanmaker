// Script para probar la conexión del frontend con el backend
const API_BASE_URL = 'http://localhost:8000';

async function testFrontendConnection() {
    console.log('🧪 Probando conexión del frontend con el backend...');
    
    try {
        // Probar login
        console.log('\n1️⃣ Probando login...');
        const loginResponse = await fetch(`${API_BASE_URL}/api/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'empresa@test.com',
                password: 'test123'
            })
        });
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('   ✅ Login exitoso');
            console.log(`   Token: ${loginData.access.substring(0, 20)}...`);
            
            // Probar endpoint de aplicaciones
            console.log('\n2️⃣ Probando endpoint de aplicaciones...');
            const applicationsResponse = await fetch(`${API_BASE_URL}/api/applications/received_applications/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${loginData.access}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (applicationsResponse.ok) {
                const applicationsData = await applicationsResponse.json();
                console.log('   ✅ Endpoint de aplicaciones exitoso');
                console.log(`   Total aplicaciones: ${applicationsData.total}`);
                console.log(`   Aplicaciones en results: ${applicationsData.results.length}`);
                
                // Mostrar algunas aplicaciones
                if (applicationsData.results.length > 0) {
                    console.log('\n3️⃣ Primeras aplicaciones:');
                    applicationsData.results.slice(0, 3).forEach((app, index) => {
                        console.log(`   ${index + 1}. ${app.student?.name || 'Sin nombre'} -> ${app.project?.title || 'Sin título'} (${app.status})`);
                    });
                }
            } else {
                console.log(`   ❌ Error en endpoint de aplicaciones: ${applicationsResponse.status}`);
                const errorText = await applicationsResponse.text();
                console.log(`   Error: ${errorText}`);
            }
        } else {
            console.log(`   ❌ Error en login: ${loginResponse.status}`);
            const errorText = await loginResponse.text();
            console.log(`   Error: ${errorText}`);
        }
        
    } catch (error) {
        console.log(`   ❌ Error de conexión: ${error.message}`);
    }
}

// Ejecutar la prueba
testFrontendConnection(); 