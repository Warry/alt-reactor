module Main exposing (main)

import Browser
import View


main =
    Browser.document
        { init = \flags -> ( flags, Cmd.none )
        , update = \_ exit -> ( exit, Cmd.none )
        , view = view
        , subscriptions = \_ -> Sub.none
        }


view : String -> Browser.Document msg
view model =
    { title = "page title"
    , body =
        [ View.view model
        ]
    }
