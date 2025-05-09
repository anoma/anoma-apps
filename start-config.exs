eclient = Anoma.Client.Examples.EClient.create_example_client()
http_port = Application.get_env(:anoma_client, Anoma.Client.Web.Endpoint)[:http][:port]
IO.puts("#{http_port} #{eclient.node.node_id}")
Logger.configure(level: :debug)
Anoma.Node.Utility.Consensus.start_link(node_id: eclient.node.node_id, interval: 500)
File.write("config.yaml", "url: localhost\nport: #{http_port}\nnodeid: \"\"\n")
