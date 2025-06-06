from website import create_app
from flask import Flask, request, redirect
from flask_login import LoginManager, current_user


import os
import fido2.features
from urllib.parse import urlparse

# configure the fido library
fido2.features.webauthn_json_mapping.enabled = True  # this simplifies the conversion from and to json

app = create_app()

# update the flask configuration
app.config.update(
    # tell flask to use secure cookies
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='strict',

    # tell flask-login to store its state in the session (and not in the url)
    USE_SESSION_FOR_NEXT=True
)


@app.before_request
def validate_domain():
    pass  # disable the localhost-only redirect



@app.after_request
def apply_caching(response):
    """This function adds security headers to every response that is sent to the client. The security headers are
    based on the recommendations of owasp (see https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)"""

    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "same-site"
    response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"

    # Allowing 'data' scheme for images (e.g., for background-image with SVG)
    response.headers["Content-Security-Policy"] = "default-src 'none'; " \
                                                  "script-src 'self' https://cdnjs.cloudflare.com https://cdn.datatables.net https://cdn.jsdelivr.net https://code.jquery.com https://stackpath.bootstrapcdn.com; " \
                                                  "connect-src 'self'; " \
                                                  "img-src 'self' data:; " \
                                                  "style-src 'self' https://cdnjs.cloudflare.com https://cdn.datatables.net https://cdn.jsdelivr.net https://code.jquery.com https://stackpath.bootstrapcdn.com; " \
                                                  "font-src 'self' https://cdnjs.cloudflare.com https://stackpath.bootstrapcdn.com https://cdn.jsdelivr.net https://stackpath.bootstrapcdn.com data:; " \
                                                  "form-action 'self'; " \
                                                  "upgrade-insecure-requests; " \
                                                  "frame-ancestors 'none'; " \
                                                  "base-uri 'self';"

    return response

def main():
    app.run(host="0.0.0.0", port=5000, ssl_context="adhoc", debug=True)
    #Turn off debug mode after production

if __name__ == "__main__":
    main()

    
