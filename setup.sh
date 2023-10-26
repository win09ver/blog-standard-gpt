#!/bin/bash

curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
yes 'sk_test_51O2rnXIJZSKh13U48TsmoOjeiW4C8uXv9gr9JOYKfR50XASaOPfoH7hX8O3ICME7X3DiuSb8DdU3oYDXIJQxKwDR00leO2lNvQ' | stripe login --interactive
stripe listen --forward-to localhost:3000/api/webhooks/stripe