"""Custom validators for the simple text editor plugin."""
from django.core.validators import BaseValidator
from django.utils.deconstruct import deconstructible
from django.utils.html import strip_spaces_between_tags, strip_tags
from django.utils.translation import ngettext_lazy


@deconstructible
class HTMLMaxLengthValidator(BaseValidator):
    """
    A custom validator that limits the max length of an HTML content, counting only the real
    content, and not the HTML tags and useless spaces.
    """

    message = ngettext_lazy(
        "Ensure this text has at most %(limit_value)d character (it has %(show_value)d).",
        "Ensure this text has at most %(limit_value)d characters (it has %(show_value)d).",
        "limit_value",
    )
    code = "max_length_html"

    def compare(self, a, b):
        """The validator should raise the error if the text length is more than the limit."""
        return a > b

    def clean(self, x):
        """Strip all HTML tags and useless spaces before counting the number of characters."""
        return len(strip_tags(strip_spaces_between_tags(x)).replace("&nbsp;", ""))
